const { google } = require("googleapis");
const fs = require("fs");

const OAUTH_REDIRECT_URI = "http://localhost:3333/oauth2callback";
const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

function getEmailConfig() {
  return {
    user: process.env.GMAIL_USER || "farukz@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  };
}

function isGoogleApiConfigured(config = getEmailConfig()) {
  return !!(config.clientId && config.clientSecret && config.refreshToken && config.user);
}

function isEmailConfigured() {
  return isGoogleApiConfigured();
}

function getEmailConfigError() {
  return "Email not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN in .env (run: npm run google:auth).";
}

function createOAuth2Client(config = getEmailConfig()) {
  const oauth2 = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    OAUTH_REDIRECT_URI
  );
  oauth2.setCredentials({ refresh_token: config.refreshToken });
  return oauth2;
}

function encodeSubject(subject) {
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

function buildRawEmail({ from, to, subject, body, attachmentPath, attachmentFilename }) {
  const boundary = `boundary_${Date.now()}`;
  const pdfBase64 = fs.readFileSync(attachmentPath).toString("base64");
  const wrappedPdf = pdfBase64.match(/.{1,76}/g)?.join("\r\n") || pdfBase64;

  const message = [
    `From: "Faruk Zahra" <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${attachmentFilename}"`,
    `Content-Disposition: attachment; filename="${attachmentFilename}"`,
    "Content-Transfer-Encoding: base64",
    "",
    wrappedPdf,
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendResumeEmail({ to, subject, body, pdfPath, attachmentFilename }) {
  if (!isEmailConfigured()) {
    const error = new Error(getEmailConfigError());
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  const config = getEmailConfig();
  const auth = createOAuth2Client(config);
  const gmail = google.gmail({ version: "v1", auth });
  const raw = buildRawEmail({
    from: config.user,
    to,
    subject,
    body,
    attachmentPath: pdfPath,
    attachmentFilename,
  });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

module.exports = {
  GMAIL_SCOPES,
  OAUTH_REDIRECT_URI,
  createOAuth2Client,
  getEmailConfig,
  getEmailConfigError,
  isEmailConfigured,
  isGoogleApiConfigured,
  sendResumeEmail,
};
