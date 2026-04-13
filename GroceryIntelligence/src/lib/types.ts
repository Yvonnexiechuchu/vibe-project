// Core domain types — align with the Google Sheets tabs in the PRD.

export type Category =
  | "Produce"
  | "Protein — meat & seafood"
  | "Protein — eggs & dairy"
  | "Frozen"
  | "Pantry & dry goods"
  | "Beverages"
  | "Snacks"
  | "Bakery & bread"
  | "Condiments & sauces"
  | "Supplements & health"
  | "Household"
  | "Other";

export const CATEGORIES: Category[] = [
  "Produce",
  "Protein — meat & seafood",
  "Protein — eggs & dairy",
  "Frozen",
  "Pantry & dry goods",
  "Beverages",
  "Snacks",
  "Bakery & bread",
  "Condiments & sauces",
  "Supplements & health",
  "Household",
  "Other",
];

export type Unit = "g" | "oz" | "lb" | "kg" | "ml" | "L" | "fl_oz" | "count";

export const WEIGHT_UNITS: Unit[] = ["g", "oz", "lb", "kg"];
export const VOLUME_UNITS: Unit[] = ["ml", "L", "fl_oz"];

/** Row from the `items` tab — master item registry. */
export type Item = {
  id: string;
  canonicalName: string;
  category: Category;
  lockedUnit: Unit;
  createdAt: string; // ISO
};

/** Row from the `stores` tab. */
export type Store = {
  id: string;
  name: string;
  createdAt: string;
};

/** Row from the `prices` tab — one per receipt line. */
export type PriceEntry = {
  id: string;
  itemId: string;
  storeId: string;
  purchaseDate: string; // ISO date (YYYY-MM-DD)
  organic: boolean;
  frozen: boolean;
  bulk: boolean;
  brand: string | null;
  packageSize: number; // in the locked unit
  packageSizeRaw: string; // original label e.g. "5oz"
  totalPrice: number; // USD
  unitPrice: number; // per locked unit
  receiptLineRaw: string | null;
  createdAt: string;
};

/** Row from the `organic_research` tab. */
export type OrganicResearch = {
  category: Category;
  summary: string;
  keyDifferences: string;
  pesticideImpact: string;
  sources: string; // JSON array of {title, url}
  refreshedAt: string;
};

// -------- Parsing / checklist transient types --------

/** AI-parsed receipt line — pre-user-review. */
export type ParsedReceiptItem = {
  rawText: string;
  suggestedName: string;
  suggestedCategory: Category;
  organic: boolean;
  frozen: boolean;
  brand: string | null;
  packageSize: number | null;
  packageSizeUnit: Unit | null;
  packageSizeRaw: string | null;
  totalPrice: number;
  unitPrice: number | null;
  bulk: boolean;
  matchedItemId: string | null; // from auto-matching against existing items
};

export type ParsedReceipt = {
  storeName: string;
  storeId: string | null; // resolved against existing stores
  purchaseDate: string;
  items: ParsedReceiptItem[];
  total: number | null;
};

/** A checklist row in the review UI — mutable. */
export type ChecklistItem = ParsedReceiptItem & {
  key: string;
  include: boolean;
};
