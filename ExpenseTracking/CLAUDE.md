# ExpenseTracking

Personal finance dashboard built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `python generate_data.py` — Regenerate JSON data files from Google Sheets

## Architecture

- **Next.js App Router** with `src/` directory and `@/` path alias
- **Server component** (`src/app/page.tsx`) loads JSON from `public/data/`, passes to `DashboardClient`
- **DashboardClient** is the main orchestrator — manages date range state, filters data with `useMemo`, renders 13+ child components
- **API routes**: `/api/chat` (Claude AI Q&A streaming), `/api/refresh` (triggers Python data regeneration)
- **Data layer**: No database. Python scripts generate JSON files into `public/data/`. Next.js reads them with `readFileSync()` at render time.
- **AI integration**: Anthropic Claude SDK for chat Q&A and financial reports. System prompts are in Chinese (CFA/CFP advisor persona).

## Tech Stack

- Next.js 16 + React 19 + TypeScript (strict mode)
- Tailwind CSS 4 (with `@tailwindcss/postcss`, `@theme` syntax)
- Recharts for charts
- ESLint 9 (core-web-vitals + typescript configs)
- No Prettier, no test framework configured

## Coding Conventions

- All components are functional, use `"use client"` directive where needed
- PascalCase filenames for components (e.g., `SpendingChart.tsx`)
- Props interfaces named `ComponentNameProps` with `Readonly<{}>` wrapper
- Types centralized in `src/lib/types.ts`
- State management: `useState` + `useMemo` + `useCallback` only, no global state library
- Styling: Tailwind utility classes only, no custom CSS classes

## Theme Colors (CSS variables in globals.css)

- `--slate-blue: #7B92AD` — headers, accents
- `--light-blue: #A8C4D8` — card backgrounds
- `--cream: #F2E8D5` — page background
- `--sand: #C4B69C` — borders, muted text
- `--dark-blue: #5A7394` — hover, emphasis

## Environment Variables

- `ANTHROPIC_API_KEY` — Required for AI chat and reports
- `OPENAI_API_KEY` — Fallback AI provider (in `.env.local`)
- `GOOGLE_SHEET_ID` — Source spreadsheet for Python data pipeline
