# Mend

A personal recovery and habit tracker for post-surgery recovery alongside fitness goals.

## Features

- **Today** — a single daily hub: sleep/pain/energy check-in with an optional note, quick weight log, and checklists for medications, PT exercises, and habits — all in under a minute
- **Weight** — log daily body weight in kg, view week/month/all-time trend graph
- **Plan** — manage medications (dosage, times per day, adherence history), PT exercises (custom, with completion history and pain notes), habits (with streak tracking), and appointments (upcoming/past, with the next one surfaced on Today)
- **Overview** — a weekly recovery score (0-100, combining sleep, pain trend, medication adherence, and habit completion), an auto-generated weekly recap, a color-coded calendar heatmap of daily check-ins, pain/weight trends, habit streaks, and a milestone timeline
- **Settings** — export a local JSON backup

Hitting a habit streak milestone (3, 7, 14, 30, 60, or 100 days) triggers a small confetti celebration.

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

Vite, React, TypeScript, Tailwind CSS, Zustand (persisted store), Recharts, canvas-confetti.
