import { NextRequest, NextResponse } from "next/server";
import {
  appendPrice,
  ensureHeaders,
  listItems,
  listStores,
  upsertItem,
  upsertStore,
} from "@/lib/google-sheets";
import { shortId } from "@/lib/id";
import { convert } from "@/lib/units";
import type { ChecklistItem, Item, PriceEntry, Store, Unit } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  storeName: string;
  purchaseDate: string;
  items: (ChecklistItem & {
    /** The unit the user locked for this item (only used on first entry). */
    lockedUnit?: Unit;
    /** Category confirmed on the checklist. */
    confirmedCategory: string;
    confirmedName: string;
  })[];
};

export async function POST(req: NextRequest) {
  try {
    await ensureHeaders();
    const body = (await req.json()) as Body;

    const [existingItems, existingStores] = await Promise.all([
      listItems(),
      listStores(),
    ]);

    // Resolve / create store
    let store: Store | undefined = existingStores.find(
      (s) => s.name.toLowerCase() === body.storeName.toLowerCase()
    );
    if (!store) {
      store = {
        id: shortId("str"),
        name: body.storeName,
        createdAt: new Date().toISOString(),
      };
      await upsertStore(store);
    }

    const now = new Date().toISOString();
    const createdItemCache: Map<string, Item> = new Map(
      existingItems.map((i) => [i.id, i])
    );
    let savedCount = 0;

    for (const row of body.items) {
      if (!row.include) continue;
      if (!row.packageSize || !row.packageSizeUnit) continue;

      let item: Item | undefined = row.matchedItemId
        ? createdItemCache.get(row.matchedItemId)
        : undefined;

      if (!item) {
        // Try one more time by case-insensitive name match
        const match = [...createdItemCache.values()].find(
          (i) =>
            i.canonicalName.toLowerCase() === row.confirmedName.toLowerCase()
        );
        item = match;
      }

      if (!item) {
        item = {
          id: shortId("itm"),
          canonicalName: row.confirmedName,
          category: row.confirmedCategory as Item["category"],
          lockedUnit: row.lockedUnit ?? row.packageSizeUnit,
          createdAt: now,
        };
        await upsertItem(item);
        createdItemCache.set(item.id, item);
      } else if (
        item.canonicalName !== row.confirmedName ||
        item.category !== row.confirmedCategory
      ) {
        item = {
          ...item,
          canonicalName: row.confirmedName,
          category: row.confirmedCategory as Item["category"],
        };
        await upsertItem(item);
        createdItemCache.set(item.id, item);
      }

      const packageSizeInLocked =
        convert(row.packageSize, row.packageSizeUnit, item.lockedUnit) ??
        row.packageSize;

      const unitPrice =
        row.unitPrice && row.packageSizeUnit === item.lockedUnit
          ? row.unitPrice
          : packageSizeInLocked > 0
          ? row.totalPrice / packageSizeInLocked
          : 0;

      const entry: PriceEntry = {
        id: shortId("prc"),
        itemId: item.id,
        storeId: store.id,
        purchaseDate: body.purchaseDate,
        organic: row.organic,
        frozen: row.frozen,
        canned: row.canned ?? false,
        bulk: row.bulk,
        brand: row.brand,
        packageSize: packageSizeInLocked,
        packageSizeRaw: row.packageSizeRaw ?? `${row.packageSize}${row.packageSizeUnit}`,
        totalPrice: row.totalPrice,
        unitPrice,
        receiptLineRaw: row.rawText,
        createdAt: now,
      };

      await appendPrice(entry);
      savedCount += 1;
    }

    return NextResponse.json({ ok: true, savedCount, storeId: store.id });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
