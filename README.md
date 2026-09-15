# recomp

A personal fitness & nutrition tracker for post-surgery muscle and weight gain.

## Features

- **Weight** — log daily body weight, view week/month/all-time trend graph
- **Workouts** — log sets/reps/weight per exercise, add custom exercises, view history and per-exercise progress charts
- **Food** — log meals with calories/protein/carbs/fat, daily totals vs. targets, browse past days
- **Dashboard** — daily summary, on-track indicator, weight trend, 7-day calorie consistency chart
- **Settings** — set daily calorie/macro targets, export a local JSON backup

All data is stored in the browser's `localStorage` — no backend, no account, works offline. Use **Settings → Export backup** periodically to keep a copy of your data.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stack

Vite, React, TypeScript, Tailwind CSS, Zustand (persisted store), Recharts.
