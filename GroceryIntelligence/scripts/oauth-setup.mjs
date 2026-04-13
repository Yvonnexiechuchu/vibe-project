#!/usr/bin/env node
/**
 * One-time OAuth flow.
 *
 * Prereqs in .env.local: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
 * Prereqs in GCP: OAuth client (type: Web application) with
 *   http://localhost:3040/callback as an authorized redirect URI.
 *
 * Runs a local HTTP server that:
 *   1. Prints an auth URL for you to open in a browser.
 *   2. Catches the redirect, exchanges the code for tokens.
 *   3. Prints the refresh token and optionally writes it into .env.local.
 */

import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { loadEnv } from "./_load-env.mjs";

loadEnv();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const PORT = 3040;
const REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "\nMissing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local.\n\n" +
      "1) In Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID\n" +
      "2) Application type: Web application\n" +
      `3) Authorized redirect URI: ${REDIRECT}\n` +
      "4) Copy the Client ID and Client secret into .env.local, then re-run this script.\n"
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);
const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n── Grocery Intelligence OAuth setup ──\n");
console.log("Step 1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nStep 2. Sign in with the Google account that should own the Sheet.");
console.log("Step 3. Approve the requested scope (Google Sheets).");
console.log(`\nWaiting for redirect on ${REDIRECT} ...\n`);

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end();
    return;
  }
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h1>Auth error: ${error}</h1><p>Check the terminal.</p>`);
    console.error("\nOAuth error:", error);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.writeHead(400);
    res.end("No ?code in callback");
    return;
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(
        "<h1>No refresh_token returned.</h1><p>Go to your Google Account → Security → Third-party access, revoke this app, then re-run the script to force a fresh consent.</p>"
      );
      console.error(
        "\nNo refresh_token returned. Revoke the app at https://myaccount.google.com/permissions and re-run."
      );
      server.close();
      process.exit(1);
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h1 style='font-family:system-ui'>Done ✓</h1><p>You can close this tab and return to the terminal.</p>"
    );

    writeToEnvLocal("GOOGLE_REFRESH_TOKEN", tokens.refresh_token);
    console.log("\nWrote GOOGLE_REFRESH_TOKEN to .env.local.");
    console.log("\nNext: npm run create-sheet");
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500);
    res.end("Token exchange failed: " + e.message);
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT);

function writeToEnvLocal(key, value) {
  const p = path.resolve(process.cwd(), ".env.local");
  let content = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    if (content && !content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }
  fs.writeFileSync(p, content, "utf8");
}
