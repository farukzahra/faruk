require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { GMAIL_SCOPES, OAUTH_REDIRECT_URI } = require("../lib/gmail");

const PORT = 3333;
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const envPath = path.join(__dirname, "..", ".env");

if (!clientId || !clientSecret) {
  console.error("\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env\n");
  console.error("1. Open https://console.cloud.google.com/");
  console.error("2. Enable Gmail API");
  console.error("3. OAuth client: Web application");
  console.error(`4. Redirect URI: ${OAUTH_REDIRECT_URI}`);
  console.error("5. OAuth consent screen → add farukz@gmail.com as Test user");
  console.error("6. Copy Client ID and Secret into .env\n");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, OAUTH_REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: GMAIL_SCOPES,
});

function saveRefreshToken(refreshToken) {
  if (!refreshToken) return;

  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const line = `GOOGLE_REFRESH_TOKEN=${refreshToken}`;

  if (/^GOOGLE_REFRESH_TOKEN=.*/m.test(content)) {
    content = content.replace(/^GOOGLE_REFRESH_TOKEN=.*/m, line);
  } else {
    content = content.trimEnd() + (content.endsWith("\n") || !content ? "" : "\n") + line + "\n";
  }

  fs.writeFileSync(envPath, content, "utf8");
  console.log("\nSaved GOOGLE_REFRESH_TOKEN to .env\n");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
    server.close();
    process.exit(1);
    return;
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Missing authorization code</h1>");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Authorization complete</h1><p>Return to the terminal and restart the server.</p>");

    if (tokens.refresh_token) {
      saveRefreshToken(tokens.refresh_token);
    } else {
      console.log("\nNo refresh token returned.");
      console.log("Revoke access at https://myaccount.google.com/permissions and run again.\n");
    }

    console.log("Restart: npm start\n");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>Token exchange failed</h1><pre>${err.message}</pre>`);
    console.error("\nToken exchange failed:", err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is in use. Close the other google:auth process and retry.\n`);
  } else {
    console.error("\nServer error:", err.message);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("\nGoogle Gmail API authorization\n");
  console.log("Add as Test user in OAuth consent screen: farukz@gmail.com");
  console.log("Redirect URI in Google Cloud:\n");
  console.log(`  ${OAUTH_REDIRECT_URI}\n`);
  console.log("Open this URL:\n");
  console.log(authUrl);
  console.log(`\nWaiting for callback on ${OAUTH_REDIRECT_URI} ...\n`);
});
