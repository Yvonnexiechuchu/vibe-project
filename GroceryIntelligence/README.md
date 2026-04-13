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
- **OAuth2 refresh token** for Sheets auth (works around `iam.disableServiceAccountKeyCreation` org policies)
- **Recharts** for price-history charts

## Setup

### 1. Anthropic
1. [console.anthropic.com](https://console.anthropic.com) → Create API Key
2. `cp .env.example .env.local`, set `ANTHROPIC_API_KEY`

### 2. Google Cloud (one-time)
1. Pick or create a GCP project
2. Enable **Google Sheets API**
3. Configure **OAuth consent screen** (Testing mode is fine for personal use; add yourself as a test user)
4. **APIs & Services → Credentials → Create OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:3040/callback`
5. Paste the Client ID + Secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 3. Install + bootstrap
```bash
npm install
npm run oauth-setup   # browser flow → writes GOOGLE_REFRESH_TOKEN
npm run create-sheet  # creates the Sheet in your Drive → writes GOOGLE_SHEET_ID
npm run dev
```

Open [localhost:3000](http://localhost:3000).

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

## Deploying to Vercel

Vercel picks up the app from the `GroceryIntelligence/` subfolder of this monorepo.

1. Import the repo in Vercel, set **Root Directory** = `GroceryIntelligence`
2. Add env vars in Project Settings → Environment Variables:
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_SHEET_ID`
3. In Google Cloud Console → Credentials → your OAuth client, add the Vercel production URL (e.g. `https://grocery-intelligence.vercel.app`) to Authorized origins if you later add a browser-side auth flow. (Not required for the current server-side-only flow.)
4. Deploy.
