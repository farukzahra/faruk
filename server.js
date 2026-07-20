require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getEmailConfigError, isEmailConfigured, sendResumeEmail } = require("./lib/gmail");
const {
  buildEmailBody,
  getDefaultSubject,
  normalizeLanguage,
  parseSalaryAmount,
} = require("./lib/email-content");

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "frontend", "dist");
const PDF_PUBLIC = path.join(__dirname, "frontend", "public", "assets", "Faruk Zahra - CV - Resume.pdf");
const PDF_DIST = path.join(DIST_DIR, "assets", "Faruk Zahra - CV - Resume.pdf");
const PDF_FILENAME = "Faruk Zahra - CV - Resume.pdf";

function resolvePdfPath() {
  if (fs.existsSync(PDF_DIST)) return PDF_DIST;
  if (fs.existsSync(PDF_PUBLIC)) return PDF_PUBLIC;
  return null;
}

function validateSendPayload(body) {
  const { to, subject, language, includeSalary, salaryAmount, salaryCurrency } = body || {};

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { error: "Invalid recipient email address." };
  }

  const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
  if (!trimmedSubject) {
    return { error: "Email subject is required." };
  }

  const lang = normalizeLanguage(language);

  const wantsSalary = includeSalary === true;
  let parsedSalary = null;
  if (wantsSalary) {
    parsedSalary = parseSalaryAmount(salaryAmount);
    if (parsedSalary !== null && salaryCurrency !== "USD" && salaryCurrency !== "BRL") {
      return { error: "Invalid salary currency. Use USD or BRL." };
    }
  }

  return {
    to: to.trim(),
    subject: trimmedSubject,
    language: lang,
    includeSalary: wantsSalary,
    salaryAmount: parsedSalary,
    salaryCurrency: salaryCurrency === "BRL" ? "BRL" : "USD",
  };
}

app.use(express.json());

const RELEASE_HISTORY_PATH = path.join(__dirname, "docs", "release-history.json");
const PROJECTS_PATH = path.join(__dirname, "docs", "projects.json");

function readJsonFile(filePath, label, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `${label} not found.` });
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error(`${label} error:`, err.message);
    res.status(500).json({ error: `Failed to read ${label.toLowerCase()}.` });
  }
}

app.get("/api/release-history", (req, res) => {
  readJsonFile(RELEASE_HISTORY_PATH, "Release history", res);
});

app.get("/api/projects", (req, res) => {
  readJsonFile(PROJECTS_PATH, "Projects catalog", res);
});

app.post("/api/send-resume", async (req, res) => {
  const validated = validateSendPayload(req.body);
  if (validated.error) {
    return res.status(400).json({ error: validated.error });
  }

  const pdfPath = resolvePdfPath();
  if (!pdfPath) {
    return res.status(500).json({ error: "Resume PDF not found on server." });
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({ error: getEmailConfigError() });
  }

  const emailBody = buildEmailBody({
    language: validated.language,
    includeSalary: validated.includeSalary,
    salaryAmount: validated.salaryAmount,
    salaryCurrency: validated.salaryCurrency,
  });

  try {
    await sendResumeEmail({
      to: validated.to,
      subject: validated.subject,
      body: emailBody,
      pdfPath,
      attachmentFilename: PDF_FILENAME,
    });

    res.json({ ok: true, message: "Resume sent successfully." });
  } catch (err) {
    if (err.code === "EMAIL_NOT_CONFIGURED") {
      return res.status(503).json({ error: err.message });
    }

    console.error("Send error:", err.message);
    res.status(500).json({ error: "Failed to send email. Check server logs." });
  }
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
} else {
  console.warn("frontend/dist not found — run: npm run build");
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Resume site running at http://localhost:${PORT}`);
  });
}

module.exports = {
  app,
  getDefaultSubject,
  resolvePdfPath,
  validateSendPayload,
};
