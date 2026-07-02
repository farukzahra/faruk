require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getEmailConfigError, isEmailConfigured, sendResumeEmail } = require("./lib/gmail");

const app = express();
const PORT = process.env.PORT || 3000;

const PDF_PATH = path.join(__dirname, "assets", "Faruk Zahra - CV - Resume.pdf");
const PDF_FILENAME = "Faruk Zahra - CV - Resume.pdf";

const DEFAULT_SUBJECT = "Application for an Open Position";
const DEFAULT_BODY = `Hi,

My name is Faruk Zahra, and I am a software developer with extensive experience in Java, Spring Boot, RESTful APIs, databases, cloud services, and software architecture.

I am currently exploring new professional opportunities and would like to apply for a position at your company. I believe my technical background, experience working with international teams, and ability to deliver reliable software solutions could be a strong fit for your team.

Please find my résumé attached for your review. I would be happy to discuss my experience and learn more about any opportunities that match my profile.

Thank you for your time and consideration.

Best regards,
Faruk Zahra`;

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/send-resume", async (req, res) => {
  const { to } = req.body || {};

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: "Invalid recipient email address." });
  }

  if (!fs.existsSync(PDF_PATH)) {
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
      pdfPath: PDF_PATH,
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

app.listen(PORT, () => {
  console.log(`Resume site running at http://localhost:${PORT}`);
});
