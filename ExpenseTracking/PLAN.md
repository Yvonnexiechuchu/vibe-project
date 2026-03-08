# Expense Tracking Dashboard — Tech Stack Migration Plan

## Context
The current Streamlit dashboard (`app.py`) requires complex Python environment setup (venv, pip, multiple dependencies) which makes it hard to run. The goal is to replace the Streamlit frontend with a **Next.js** web app while keeping all Python data processing logic intact. Python scripts generate JSON data; Next.js renders the dashboard and handles the Q&A agent.

## Color Palette (Beach Theme — primary direction, no dark/green)
- Slate blue: `#7B92AD` — headers, primary accents, chart highlights
- Light blue: `#A8C4D8` — card backgrounds, secondary elements
- Cream: `#F2E8D5` — page background
- Tan/Sand: `#C4B69C` — borders, subtle accents, muted text
- White: `#FFFFFF` — card surfaces for contrast
- Derived darker blue: `#5A7394` — hover states, emphasis

## Architecture

```
Python (data layer)              Next.js (UI layer)
┌─────────────────────┐         ┌──────────────────────────┐
│ google_sheets.py    │         │ app/page.tsx (dashboard)  │
│ analysis.py         │──JSON──▶│ app/api/chat/route.ts    │
│ cache.py            │  files  │ components/ (charts, etc) │
│ generate_data.py ★  │         │ public/data/*.json       │
└─────────────────────┘         └──────────────────────────┘
```

**★ New file**: `generate_data.py` — runs the full Python pipeline and outputs JSON files to `public/data/` for Next.js to consume.

## File Structure (new/modified files only)
```
ExpenseTracking/
├── analysis.py                  # KEEP as-is
├── cache.py                     # KEEP as-is
├── google_sheets.py             # KEEP as-is
├── generate_data.py             # NEW — Python script to export analysis as JSON
├── package.json                 # NEW — Next.js dependencies
├── next.config.ts               # NEW
├── tsconfig.json                # NEW
├── tailwind.config.ts           # NEW
├── postcss.config.mjs           # NEW
├── .env.local                   # NEW — ANTHROPIC_API_KEY (for Next.js API routes)
├── public/
│   └── data/
│       ├── summary.json         # KPIs, totals
│       ├── transactions.json    # Cleaned transaction list
│       ├── categories.json      # Category & subcategory breakdowns
│       ├── merchants.json       # Top merchants
│       ├── trends.json          # Time-series spending data
│       ├── recurring.json       # Recurring expenses
│       ├── income.json          # Income sources
│       ├── shared.json          # Shared expenses
│       ├── new_spending.json    # New merchants/categories
│       ├── payment_methods.json # Payment method breakdown
│       ├── outliers.json        # Outlier transactions
│       ├── cleaning.json        # Data cleaning summary
│       └── context.txt          # Full text context for Claude Q&A
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with beach theme
│   │   ├── page.tsx             # Dashboard page
│   │   ├── globals.css          # Global styles + color variables
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts     # Claude Q&A API endpoint
│   ├── components/
│   │   ├── KPIRow.tsx           # Metric cards
│   │   ├── SpendingChart.tsx    # Spending trends (line+bar)
│   │   ├── CategoryBreakdown.tsx# Donut + bar charts
│   │   ├── TransactionList.tsx  # Recent transactions table
│   │   ├── TopMerchants.tsx     # Merchant bar chart
│   │   ├── CashFlowTrends.tsx   # Cash flow bar chart
│   │   ├── RecurringExpenses.tsx # Recurring expense table
│   │   ├── BudgetTracker.tsx    # Budget vs actual (like Groceries/Shopping cards)
│   │   ├── TopCategories.tsx    # Horizontal bar chart
│   │   ├── SharedExpenses.tsx   # Shared expense details
│   │   ├── PaymentMethods.tsx   # Pie chart
│   │   ├── OutlierList.tsx      # Outlier transactions
│   │   ├── CleaningSummary.tsx  # Data cleaning report
│   │   ├── AIReport.tsx         # AI financial health report
│   │   ├── ChatAgent.tsx        # Q&A chat interface
│   │   └── DashboardCard.tsx    # Reusable card wrapper
│   └── lib/
│       └── types.ts             # TypeScript interfaces for JSON data
```

## Implementation Steps

### Step 1: `generate_data.py` — Python data export script
- Import existing `analysis.py` functions
- Run `load_and_clean()` on data (from Google Sheets or CSV fallback)
- Call each analysis function and serialize results to JSON files in `public/data/`
- Export `generate_full_context()` as `context.txt` for the Q&A agent
- User runs `python generate_data.py` once to prepare data, then `npm run dev` for the dashboard

### Step 2: Next.js project setup
- Initialize Next.js with TypeScript, Tailwind CSS, App Router
- Dependencies: `recharts` (React-native charts, confirmed choice), `@anthropic-ai/sdk` (Claude API for Q&A)
- Configure beach theme colors as CSS variables and Tailwind config

### Step 3: Dashboard layout (`page.tsx`)
- CSS Grid layout matching the reference image (6-widget grid)
- Top row: Spending chart (wide) | Emergency Fund + Cash summary | Cash flow trends
- Bottom row: Transactions list | Top expense categories | Budget trackers (Groceries, Shopping)
- Each widget is a `DashboardCard` with consistent styling
- Scrollable page for additional sections below the fold

### Step 4: Chart components
- Use **Recharts** for all charts (React-native, responsive, interactive)
  - `SpendingChart`: AreaChart with "this month vs last month"
  - `CashFlowTrends`: BarChart with income (green) vs expense (red) + net line
  - `CategoryBreakdown`: PieChart (donut) + horizontal BarChart
  - `TopMerchants`: horizontal BarChart
  - `PaymentMethods`: PieChart
  - `BudgetTracker`: Progress bars with budget/actual/remaining

### Step 5: Data tables
- `TransactionList`: Sortable table with merchant icon, name, amount
- `RecurringExpenses`: Table with merchant, frequency, monthly avg, total
- `OutlierList`: Flagged transactions with amounts and reasons

### Step 6: Q&A Chat Agent (`api/chat/route.ts` + `ChatAgent.tsx`)
- API route reads `context.txt` and uses Anthropic SDK to stream responses
- Chat interface at bottom of dashboard with message history
- Same system prompt as original (bilingual CFA/CFP advisor)
- Streaming responses

### Step 7: AI Financial Health Report (`AIReport.tsx`)
- Button to generate report via the same API route
- Displays structured report: spending persona, health score, hidden leaks, top 3 recommendations

## Workflow for User
```bash
# One-time setup
npm install

# Refresh data (run whenever you want fresh data)
python generate_data.py

# Start dashboard
npm run dev
```

This is much simpler than `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && streamlit run app.py`.

## Verification
1. Run `python generate_data.py` — verify JSON files appear in `public/data/`
2. Run `npm run dev` — dashboard loads at localhost:3000
3. Check all 6 main dashboard widgets render with correct data
4. Verify charts are interactive (hover tooltips, responsive)
5. Test Q&A chat: ask a question in English and Chinese
6. Test AI report generation
7. Verify beach color theme matches the palette
