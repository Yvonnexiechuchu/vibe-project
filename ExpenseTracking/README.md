# Expense Tracking Dashboard

A personal finance dashboard built with **Next.js** and **Python**. Python scripts process transaction data from Google Sheets (or CSV) and export JSON files; Next.js renders an interactive dashboard with charts, tables, and an AI-powered Q&A agent.

## Features

- **KPI summary** — monthly spending, income, savings rate at a glance
- **Spending trends** — month-over-month comparison charts
- **Cash flow** — income vs. expense bar charts with net line
- **Category & merchant breakdowns** — donut charts, horizontal bar charts
- **Transaction list** — sortable, searchable table
- **Recurring expenses** — auto-detected subscriptions and regular charges
- **Budget tracker** — budget vs. actual progress bars
- **Payment methods** — pie chart breakdown
- **Outlier detection** — flagged unusual transactions
- **AI Chat Agent** — ask questions about your finances (bilingual EN/ZH, powered by Claude)
- **AI Financial Health Report** — spending persona, health score, and recommendations

## Tech Stack

| Layer | Tech |
|-------|------|
| Data processing | Python (analysis.py, google_sheets.py, cache.py) |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Charts | Recharts |
| AI | Anthropic Claude API (@anthropic-ai/sdk) |

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- A `.env.local` file with your `ANTHROPIC_API_KEY` (required for the AI chat and report features)

## Getting Started

```bash
# Install Node dependencies
npm install

# Install Python dependencies (if not already available)
pip install pandas gspread google-auth

# Generate data from Google Sheets (or CSV fallback)
python generate_data.py

# Start the dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
ExpenseTracking/
├── analysis.py            # Python analysis functions
├── google_sheets.py       # Google Sheets data loader
├── cache.py               # Caching layer
├── generate_data.py       # Exports analysis results as JSON → public/data/
├── src/
│   ├── app/
│   │   ├── page.tsx       # Dashboard page
│   │   ├── layout.tsx     # Root layout (beach theme)
│   │   └── api/chat/      # Claude Q&A API route
│   ├── components/        # Dashboard widgets (charts, tables, cards)
│   └── lib/types.ts       # TypeScript interfaces
├── public/data/           # Generated JSON files consumed by the frontend
└── PLAN.md                # Architecture & migration plan
```

## Refreshing Data

Run `python generate_data.py` whenever you want to update the dashboard with fresh transaction data. The script outputs JSON files to `public/data/` which the frontend reads at runtime.

## Color Theme

The dashboard uses a beach-inspired palette:

- Slate blue `#7B92AD` — headers, accents
- Light blue `#A8C4D8` — card backgrounds
- Cream `#F2E8D5` — page background
- Tan/Sand `#C4B69C` — borders, muted text
- White `#FFFFFF` — card surfaces
