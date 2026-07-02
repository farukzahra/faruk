require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getEmailConfigError, isEmailConfigured, sendResumeEmail } = require("./lib/gmail");

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, "frontend", "dist");
const PDF_PUBLIC = path.join(__dirname, "frontend", "public", "assets", "Faruk Zahra - CV - Resume.pdf");
const PDF_DIST = path.join(DIST_DIR, "assets", "Faruk Zahra - CV - Resume.pdf");
const PDF_FILENAME = "Faruk Zahra - CV - Resume.pdf";

const DEFAULT_SUBJECT = "Application for an Open Position";
const DEFAULT_BODY = `Hi,

My name is Faruk Zahra, and I am a software developer with extensive experience in Java, Spring Boot, RESTful APIs, databases, cloud services, and software architecture.

I am currently exploring new professional opportunities and would like to apply for a position at your company. I believe my technical background, experience working with international teams, and ability to deliver reliable software solutions could be a strong fit for your team.

Please find my résumé attached for your review. I would be happy to discuss my experience and learn more about any opportunities that match my profile.

Thank you for your time and consideration.

Best regards,
Faruk Zahra`;

function resolvePdfPath() {
  if (fs.existsSync(PDF_DIST)) return PDF_DIST;
  if (fs.existsSync(PDF_PUBLIC)) return PDF_PUBLIC;
  return null;
}

app.use(express.json());

app.post("/api/send-resume", async (req, res) => {
  const { to } = req.body || {};

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: "Invalid recipient email address." });
  }

  const pdfPath = resolvePdfPath();
  if (!pdfPath) {
    return res.status(500).json({ error: "Resume PDF not found on server." });
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({ error: getEmailConfigError() });
  }

  try {
    await sendResumeEmail({
      to,
      subject: DEFAULT_SUBJECT,
      body: DEFAULT_BODY,
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

app.listen(PORT, () => {
  console.log(`Resume site running at http://localhost:${PORT}`);
});
