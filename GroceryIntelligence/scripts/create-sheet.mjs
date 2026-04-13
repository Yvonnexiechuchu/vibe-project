#!/usr/bin/env node
/**
 * Creates a new Google Sheet in the signed-in user's Drive with the 4 tabs
 * (items, prices, stores, organic_research) and header rows pre-filled.
 *
 * Prereqs: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN set
 * in .env.local (run `npm run oauth-setup` first).
 *
 * On success, prints the sheet URL and writes GOOGLE_SHEET_ID to .env.local.
 */

import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { loadEnv } from "./_load-env.mjs";

loadEnv();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
  process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
  console.error(
    "\nMissing OAuth env vars. Run `npm run oauth-setup` first.\n"
  );
  process.exit(1);
}

const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
const sheets = google.sheets({ version: "v4", auth });

const TABS = {
  items: ["id", "canonicalName", "category", "lockedUnit", "createdAt"],
  stores: ["id", "name", "createdAt"],
  prices: [
    "id",
    "itemId",
    "storeId",
    "purchaseDate",
    "organic",
    "frozen",
    "bulk",
    "brand",
    "packageSize",
    "packageSizeRaw",
    "totalPrice",
    "unitPrice",
    "receiptLineRaw",
    "createdAt",
  ],
  organic_research: [
    "category",
    "summary",
    "keyDifferences",
    "pesticideImpact",
    "sources",
    "refreshedAt",
  ],
};

const TITLE = `Grocery Intelligence — ${new Date().toISOString().slice(0, 10)}`;

async function main() {
  console.log(`\nCreating sheet "${TITLE}" …`);

  const create = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: TITLE },
      sheets: Object.keys(TABS).map((title, i) => ({
        properties: { title, index: i },
      })),
    },
  });

  const spreadsheetId = create.data.spreadsheetId;
  const url = create.data.spreadsheetUrl;
  console.log(`Created: ${url}`);

  // Remove the default "Sheet1" that Sheets may still add.
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const defaultSheet = (meta.data.sheets || []).find(
    (s) => s.properties?.title === "Sheet1"
  );
  if (defaultSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { deleteSheet: { sheetId: defaultSheet.properties.sheetId } },
        ],
      },
    });
  }

  // Write header rows
  for (const [tab, headers] of Object.entries(TABS)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    console.log(`  ↳ ${tab}: headers written`);
  }

  writeToEnvLocal("GOOGLE_SHEET_ID", spreadsheetId);
  console.log(`\nWrote GOOGLE_SHEET_ID=${spreadsheetId} to .env.local.`);
  console.log(`\nOpen your sheet: ${url}\n`);
}

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

main().catch((e) => {
  console.error("\nFailed:", e.message);
  console.error(e);
  process.exit(1);
});
