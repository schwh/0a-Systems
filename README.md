# 0a Systems

Cross-platform event forecasting analytics dashboard.

**Stack:** Next.js 15 · React 19 · TypeScript · Recharts · Lucide Icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    layout.tsx          # Root layout
    page.tsx            # Entry point → Dashboard
  components/
    Dashboard.tsx       # Main tabbed dashboard (Overview, Models, Events)
    reserve/
      AllChartsV2.tsx   # Single-page layout with all charts (reserved)
```

## Pages

- **Overview** — KPI metrics, sparklines, system status
- **Models** — F1 history, cosine similarity, β sensitivity
- **Events** — Precursor storyline, score distribution, detection log
- **Pipeline** — _Coming soon_
- **Countries** — _Coming soon_

## License

Proprietary. All rights reserved.
