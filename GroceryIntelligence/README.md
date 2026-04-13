# Grocery Intelligence

A mobile-first grocery price tracker and organic recommender. Upload a receipt
photo → Claude parses every line → you confirm the checklist → your Sheet
becomes a personal price intelligence database.

Built from [grocery-tracker-prd.md](./grocery-tracker-prd.md). Visual language
borrowed from the Contra wireframe kit: 2px ink borders, hard offset shadows,
Montserrat Bold/ExtraBold, saturated accents.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** + custom neo-brutalist token system (`globals.css`)
- **Anthropic Claude** (Opus 4.6) for vision parsing, NL queries, organic research
- **Google Sheets** as the database — 4 tabs (items, prices, stores, organic_research)
- **Recharts** for price-history charts

## Setup

1. Create a Google Cloud project, enable the **Sheets API**, and create a
   **Service Account**. Download its JSON key.
2. Create an empty Google Sheet. Share it with the service account email
   (Editor). Copy the sheet ID from the URL.
3. Copy `.env.example` → `.env.local` and fill in:
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste the `private_key` value from the JSON — keep
     the `\n` escape sequences)
4. `npm install`
5. `npm run dev` — the first API call to `/api/data` will auto-create the
   4 tabs and header rows in your Sheet.

## App surface

| Route | What it is |
|---|---|
| `/` | Home — proactive insights + KPIs + quick actions |
| `/upload` | Camera or file upload + AI parse |
| `/review` | Checklist review page (F2) — edit every line |
| `/review/summary` | Store / date / total confirmation + save |
| `/items` | Searchable item registry with best-price preview |
| `/items/[id]` | Price history chart, store comparison, organic panel |
| `/chat` | Natural-language query interface |
| `/organic` | Category-level organic intelligence with sources |

## API

| Route | Purpose |
|---|---|
| `GET /api/data` | Full snapshot (items + stores + prices + research) |
| `POST /api/parse-receipt` | `{ base64, mimeType }` → parsed receipt JSON |
| `POST /api/save-receipt` | Persist checklist to Sheets |
| `POST /api/chat` | `{ question }` → answer string |
| `POST /api/organic` | `{ category, force? }` → cached or fresh research |

## Deploying

Deploy on Vercel. Add the four env vars in the project settings. `GOOGLE_PRIVATE_KEY` must keep its `\n` escapes when pasted into Vercel.
