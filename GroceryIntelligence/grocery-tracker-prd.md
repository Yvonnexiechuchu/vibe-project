# Grocery Price Tracker & Recommender — PRD

**Version:** 1.0  
**Date:** April 2026  
**Status:** Draft  
**Platform:** Mobile-first web app (Next.js + Vercel)  
**Scope:** Single user  

---

## 1. Problem Statement

Grocery prices in the US are rising sharply and vary significantly across chain stores. Users who prefer organic food lack a simple tool to:

- Track unit prices over time and across stores
- Make informed decisions about whether organic variants are worth the premium for specific food items
- Understand their own spending patterns and how inflation is affecting their grocery basket

No existing tool combines receipt parsing, cross-store price comparison, inflation tracking, and food-specific organic intelligence in one place.

---

## 2. Goal

Build a mobile-first web app that turns grocery receipt photos into a personal price intelligence database — enabling the user to find the best price for any item, track spending and inflation trends, and get evidence-based organic recommendations per food category.

---

## 3. Target User

| Attribute | Detail |
|---|---|
| Profile | Single user, health-conscious grocery shopper |
| Stores | Whole Foods, Trader Joe's, Costco, H Mart, and similar Asian chain stores (e.g. 99 Ranch) |
| Behavior | Shops regularly at multiple chains, values organic but is price-sensitive, wants to optimize spend without sacrificing quality |
| Device | Mobile-first; uploads receipt photos in-store or at home |
| Data history | Starting fresh — no historical receipt import |

---

## 4. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React), deployed on Vercel |
| Database | Google Sheets (via Google Sheets API) |
| AI | Anthropic API — Claude (receipt parsing, NL queries, organic research, category assignment) |
| Auth | Google OAuth (single login for app + Sheets access) |
| Image handling | Receipt photo uploaded → sent to Claude Vision API for parsing |

### Google Sheet structure (tabs)

| Tab | Purpose |
|---|---|
| `items` | Master item registry — canonical name, category, unit of measure, variants |
| `prices` | Every price entry — item ID, store, date, unit price, total paid, bulk flag |
| `stores` | Store registry |
| `organic_research` | Cached organic analysis per food category + last refreshed date |

---

## 5. Core Features

### F1 — Receipt Upload & AI Parsing

**Flow:**

1. User uploads a receipt photo or screenshot (camera capture or image picker)
2. AI (Claude Vision) parses all line items — normalizes cryptic abbreviations (e.g. "ORG SPNCH 5OZ" → Organic Spinach, 5oz). Auto-detects store name and purchase date from receipt header
3. User is taken to a **Checklist Review Page** (see F2)
4. After checklist, user sees a **Summary Confirmation Screen** showing store, date, item count, and total — confirms before data is saved

---

### F2 — Checklist Review Page

The central UX for data quality. Every recognized item is listed with:

- Editable item name (AI-suggested, user can correct)
- Category (AI-assigned on first entry; defaults to existing DB value on repeat — user confirms with a single tap)
- Organic toggle (Yes / No)
- Frozen toggle (Yes / No)
- Brand (optional, editable)
- Package size / quantity (editable)
- Unit of measure (see Unit Standardization below)
- Unit price (pulled from receipt/packaging if available; otherwise calculated — editable)
- Include / exclude toggle (user can exclude items they don't want tracked)

**Unit standardization rule:** On an item's first entry, the app prompts the user to confirm the default unit (weight in g/oz by default; L/ml for liquids). Once confirmed, that unit is locked for all future entries of that item to ensure consistent cross-store comparison.

**Category assignment rule:**
- First entry: AI assigns category, user confirms on checklist
- Repeat purchase: App defaults to the previously used category, user taps to confirm (minimizing friction)

---

## 6. Item Data Schema

| Field | Source | Notes |
|---|---|---|
| Item name | AI parsed + user editable | Standardized canonical label, e.g. "Spinach" |
| Category | AI on first entry; DB default on repeat | User confirms each time on checklist |
| Variant: organic | AI parsed + user toggle | Yes / No |
| Variant: frozen | AI parsed + user toggle | Yes / No |
| Brand | AI parsed + user editable | Optional |
| Store | Auto-detected from receipt | Separate dimension — not part of item identity |
| Purchase date | Auto-detected from receipt | Used for inflation tracking |
| Package size | AI parsed + user entry if missing | e.g. 142g, 5oz, 1L |
| Unit of measure | Prompted on first entry, locked thereafter | Default: weight (g or oz); liquids: L or ml |
| Total price paid | Receipt | USD |
| Unit price | Printed on receipt/packaging if available; otherwise calculated | Price per locked unit |
| Bulk flag | AI inferred + user toggle | Separate field; surfaced in recommendations |

---

## 7. Item Identity & Matching

Items are identified by a **canonical name** (e.g. "Spinach") with **variants** (organic/conventional, fresh/frozen) tracked as attributes — not as separate items. Store is always a separate dimension.

### Auto-matching
AI attempts to match new receipt line items to existing database entries (e.g. "ORG BABY SPINACH 142G" → Spinach, organic, fresh). User can override on the checklist.

### Cross-store variant handling
If a variant (e.g. organic spinach) is not available at a store, the recommender will surface which other tracked stores carry it.

### Bulk flag
Costco and similar bulk purchases are flagged. Shown as a contextual note in recommendations — e.g. "40% cheaper per oz but requires 5x the quantity; consider freshness for perishables."

### Frozen as a variant
Frozen spinach and fresh spinach are the same item with a "frozen" label — not separate entries.

---

## 8. Recommendation & Query Interface

Two entry points for querying the data:

### Natural language chat
User types a free-form question, e.g. "Where should I buy organic spinach?" and receives a structured conversational answer.

**Sample response format for "Where should I buy organic spinach?":**
- Lowest unit price ever recorded + store + date
- How often purchased and average quantity per trip
- Price comparison across all stores where it has appeared
- Bulk flag note if applicable
- Confidence / data quality note (e.g. "Based on 4 purchases over 6 weeks — still building history")
- Collapsible inline organic analysis (see F4)

### Structured item dashboard
Browse by item → view price history chart, store comparison table, and organic analysis panel.

---

## 9. Analytics & Inflation Tracking

### Item-level
- Price history chart per item per store over time
- % change since first recorded purchase (personal inflation indicator)
- Best price ever vs. most recent price
- Purchase frequency and average spend per item

### Basket-level
- Total monthly spend trend
- Spend breakdown by category (produce, protein, dairy, pantry, etc.)
- Store-level spend share
- Organic vs. conventional spend ratio

---

## 10. Organic Intelligence (F4)

| Attribute | Detail |
|---|---|
| What it answers | For each food category: key differences between organic and conventional, health and pesticide impact (e.g. EWG Dirty Dozen), and price premium context from the user's own price history |
| Data policy | Real sources cited. No hallucinated or invented claims. Source and research date always shown. |
| Refresh cadence | Cached per food category. Refreshed quarterly or on explicit user request. One AI research call per category per quarter — token-efficient. |
| UI placement | Collapsible "Is organic worth it?" section on each item detail page and within query responses. Collapsed by default. |

---

## 11. Proactive Insights

Surfaced on the home screen at the start of each session. Examples:

- "Organic eggs at Whole Foods are up 18% since you started tracking."
- "You haven't found a cheaper source for wild salmon in 2 months."
- "Trader Joe's has your best ever recorded price for spinach."
- "Your produce spend increased 22% this month vs. last month."

> Note: Insights are only surfaced when sufficient data exists. Early sessions show a prompt encouraging continued receipt uploads to unlock this feature.

---

## 12. Categories

Default category list (AI-assigned, user-confirmed):

- Produce
- Protein — meat & seafood
- Protein — eggs & dairy
- Frozen
- Pantry & dry goods
- Beverages
- Snacks
- Bakery & bread
- Condiments & sauces
- Supplements & health
- Household
- Other

---

## 13. Feature Priority

| Feature | Priority |
|---|---|
| Receipt upload + AI parsing | P1 — MVP |
| Checklist review page + item schema | P1 — MVP |
| Item database with variants & store dimensions (Google Sheets) | P1 — MVP |
| Natural language query interface | P1 — MVP |
| Item-level price history & cross-store comparison | P1 — MVP |
| Organic intelligence panel (collapsible, quarterly refresh) | P2 |
| Basket-level analytics & spend dashboard | P2 |
| Proactive insights on home screen | P2 |
| Structured item dashboard UI | P3 |
| Inflation trend visualization | P3 |

---

## 14. Open Questions Before Building

- [ ] Google OAuth setup: confirm the Google account to use for Sheets integration
- [ ] Vercel account: confirm existing account or set up new one linked to GitHub
- [ ] GitHub repo: create new repo for this project
- [ ] Anthropic API key: confirm active API key at console.anthropic.com

---

## 15. Summary of Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Database | Google Sheets | Human-readable, inspectable, free, no backend infra needed |
| Deployment | Vercel (Next.js) | Fast, free tier, great DX, easy to iterate |
| Auth | Google OAuth | Single login covers app + Sheets access |
| Unit standardization | Per-item, user-confirmed on first entry, locked thereafter | Ensures fair cross-store price comparison |
| Organic vs. conventional | Variants of the same item | Cleaner data model, better cross-store recommendations |
| Frozen vs. fresh | Variant label, not separate item | Simpler item registry |
| Organic research | Quarterly refresh, real sources, cached | Token-efficient, trustworthy, low maintenance |
| Multi-user | Single user for now | Simplifies auth and data model |
| Data history | Starting fresh — no historical import | Reduces scope, still valuable from day one |
