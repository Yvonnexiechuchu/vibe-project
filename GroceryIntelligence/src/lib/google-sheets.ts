/**
 * Google Sheets data layer.
 *
 * Auth: OAuth2 refresh token (works even when org policy disables
 * service-account keys). The app acts on behalf of the user who ran the
 * one-time `scripts/oauth-setup.mjs` flow.
 *
 * `ensureHeaders()` creates the 4 tabs / writes header rows if missing, so
 * an empty spreadsheet is enough — no manual column setup required.
 */

import { google, sheets_v4 } from "googleapis";
import type {
  Category,
  Item,
  OrganicResearch,
  PriceEntry,
  Store,
  Unit,
} from "./types";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

type Tab = "items" | "prices" | "stores" | "organic_research";

const HEADERS: Record<Tab, string[]> = {
  items: ["id", "canonicalName", "category", "lockedUnit", "createdAt"],
  stores: ["id", "name", "createdAt"],
  prices: [
    "id",
    "itemId",
    "storeId",
    "purchaseDate",
    "organic",
    "frozen",
    "canned",
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

let cachedClient: sheets_v4.Sheets | null = null;
let cachedSpreadsheetId: string | null = null;

function getClient(): { sheets: sheets_v4.Sheets; spreadsheetId: string } {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!spreadsheetId || !clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Sheets env vars missing. Set GOOGLE_SHEET_ID, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN."
    );
  }

  if (cachedClient && cachedSpreadsheetId === spreadsheetId) {
    return { sheets: cachedClient, spreadsheetId };
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  cachedClient = google.sheets({ version: "v4", auth });
  cachedSpreadsheetId = spreadsheetId;
  return { sheets: cachedClient, spreadsheetId };
}

// --------- Read cache (avoid Sheets API rate limits during dev) ---------

const READ_CACHE_TTL = 15_000; // 15 seconds
const readCache = new Map<string, { data: string[][]; ts: number }>();

export function invalidateReadCache(tab?: Tab) {
  if (tab) {
    readCache.delete(tab);
  } else {
    readCache.clear();
  }
}

// --------- Low-level helpers ---------

async function readRange(tab: Tab): Promise<string[][]> {
  const hit = readCache.get(tab);
  if (hit && Date.now() - hit.ts < READ_CACHE_TTL) {
    return hit.data;
  }

  const { sheets, spreadsheetId } = getClient();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab}!A1:Z10000`,
    });
    const data = res.data.values ?? [];
    readCache.set(tab, { data, ts: Date.now() });
    return data;
  } catch (err) {
    const e = err as { code?: number; message?: string };
    if (e.code === 400 || /Unable to parse range/.test(e.message ?? "")) {
      return [];
    }
    throw err;
  }
}

async function appendRow(tab: Tab, row: (string | number | boolean)[]) {
  invalidateReadCache(tab);
  const { sheets, spreadsheetId } = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:Z`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}

async function writeRow(tab: Tab, rowNumber: number, row: (string | number | boolean)[]) {
  invalidateReadCache(tab);
  const { sheets, spreadsheetId } = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}

export async function ensureHeaders(): Promise<void> {
  const { sheets, spreadsheetId } = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set(
    (meta.data.sheets ?? []).map((s) => s.properties?.title ?? "")
  );
  const missing: Tab[] = (Object.keys(HEADERS) as Tab[]).filter(
    (t) => !existing.has(t)
  );
  if (missing.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
  }
  for (const tab of Object.keys(HEADERS) as Tab[]) {
    const rows = await readRange(tab);
    if (rows.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS[tab]] },
      });
    }
  }
}

// --------- Items ---------

function rowToItem(row: string[]): Item | null {
  if (!row[0]) return null;
  return {
    id: row[0],
    canonicalName: row[1] ?? "",
    category: (row[2] as Category) ?? "Other",
    lockedUnit: (row[3] as Unit) ?? "g",
    createdAt: row[4] ?? "",
  };
}

export async function listItems(): Promise<Item[]> {
  const rows = await readRange("items");
  return rows.slice(1).map(rowToItem).filter((v): v is Item => v !== null);
}

export async function getItem(id: string): Promise<Item | null> {
  const items = await listItems();
  return items.find((i) => i.id === id) ?? null;
}

export async function upsertItem(item: Item): Promise<void> {
  const rows = await readRange("items");
  const idx = rows.slice(1).findIndex((r) => r[0] === item.id);
  const row = [
    item.id,
    item.canonicalName,
    item.category,
    item.lockedUnit,
    item.createdAt,
  ];
  if (idx === -1) {
    await appendRow("items", row);
  } else {
    await writeRow("items", idx + 2, row);
  }
}

// --------- Stores ---------

function rowToStore(row: string[]): Store | null {
  if (!row[0]) return null;
  return { id: row[0], name: row[1] ?? "", createdAt: row[2] ?? "" };
}

export async function listStores(): Promise<Store[]> {
  const rows = await readRange("stores");
  return rows.slice(1).map(rowToStore).filter((v): v is Store => v !== null);
}

export async function upsertStore(store: Store): Promise<void> {
  const rows = await readRange("stores");
  const idx = rows.slice(1).findIndex((r) => r[0] === store.id);
  const row = [store.id, store.name, store.createdAt];
  if (idx === -1) {
    await appendRow("stores", row);
  } else {
    await writeRow("stores", idx + 2, row);
  }
}

// --------- Prices ---------

function rowToPrice(row: string[]): PriceEntry | null {
  if (!row[0]) return null;
  return {
    id: row[0],
    itemId: row[1] ?? "",
    storeId: row[2] ?? "",
    purchaseDate: row[3] ?? "",
    organic: row[4] === "TRUE" || row[4] === "true",
    frozen: row[5] === "TRUE" || row[5] === "true",
    canned: row[6] === "TRUE" || row[6] === "true",
    bulk: row[7] === "TRUE" || row[7] === "true",
    brand: row[8] || null,
    packageSize: parseFloat(row[9] ?? "0") || 0,
    packageSizeRaw: row[10] ?? "",
    totalPrice: parseFloat(row[11] ?? "0") || 0,
    unitPrice: parseFloat(row[12] ?? "0") || 0,
    receiptLineRaw: row[13] || null,
    createdAt: row[14] ?? "",
  };
}

export async function listPrices(): Promise<PriceEntry[]> {
  const rows = await readRange("prices");
  return rows.slice(1).map(rowToPrice).filter((v): v is PriceEntry => v !== null);
}

export async function appendPrice(p: PriceEntry): Promise<void> {
  await appendRow("prices", [
    p.id,
    p.itemId,
    p.storeId,
    p.purchaseDate,
    String(p.organic).toUpperCase(),
    String(p.frozen).toUpperCase(),
    String(p.canned).toUpperCase(),
    String(p.bulk).toUpperCase(),
    p.brand ?? "",
    p.packageSize,
    p.packageSizeRaw,
    p.totalPrice,
    p.unitPrice,
    p.receiptLineRaw ?? "",
    p.createdAt,
  ]);
}

// --------- Organic research ---------

function rowToResearch(row: string[]): OrganicResearch | null {
  if (!row[0]) return null;
  return {
    category: row[0] as Category,
    summary: row[1] ?? "",
    keyDifferences: row[2] ?? "",
    pesticideImpact: row[3] ?? "",
    sources: row[4] ?? "[]",
    refreshedAt: row[5] ?? "",
  };
}

export async function listResearch(): Promise<OrganicResearch[]> {
  const rows = await readRange("organic_research");
  return rows
    .slice(1)
    .map(rowToResearch)
    .filter((v): v is OrganicResearch => v !== null);
}

export async function getResearch(cat: Category): Promise<OrganicResearch | null> {
  const all = await listResearch();
  return all.find((r) => r.category === cat) ?? null;
}

export async function upsertResearch(r: OrganicResearch): Promise<void> {
  const rows = await readRange("organic_research");
  const idx = rows.slice(1).findIndex((row) => row[0] === r.category);
  const out = [r.category, r.summary, r.keyDifferences, r.pesticideImpact, r.sources, r.refreshedAt];
  if (idx === -1) {
    await appendRow("organic_research", out);
  } else {
    await writeRow("organic_research", idx + 2, out);
  }
}

// --------- Convenience: has-data check ---------

export async function hasAnyData(): Promise<boolean> {
  try {
    const rows = await readRange("prices");
    return rows.length > 1;
  } catch {
    return false;
  }
}
