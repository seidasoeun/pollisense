# PolliSense Frontend

Production-style research dashboard for a modular plug-and-deploy insect monitoring system.

## Stack

- React + TypeScript
- Tailwind CSS
- Recharts
- Vite
- REST-ready mock service layer in `src/api/pollisenseApi.ts`

## Local Run

Install dependencies, then start Vite:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
src/
  api/                  REST-compatible data access interfaces
  components/           KPI cards, badges, panels, reusable chart components
  components/charts/    Recharts visualisations
  data/                 realistic 30-day mock dataset
  utils/                aggregation and interpretation helpers
  App.tsx               dashboard shell and pages
  types.ts              shared TypeScript contracts
```

## Dashboard Model

PolliSense keeps a shared scientific baseline for all researchers:

- insect activity over time
- environmental variables over time
- time-aligned activity and environment comparison
- station and device health
- latest alerts

The researcher layer personalises only the supported configurable aspects:

- detectable target group subset: honeybee, bumblebee, butterfly, hoverfly
- visible widgets
- default station and date range
- alert thresholds
- layout emphasis

The interface intentionally reports detectable target groups rather than claiming full species-level classification.
