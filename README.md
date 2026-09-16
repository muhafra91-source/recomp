# Mend

A personal recovery and habit tracker for post-surgery recovery alongside fitness goals.

## Features

- **Today** — a single daily hub: sleep/pain/energy check-in with an optional note, quick weight log, and checklists for medications, PT exercises, and habits — all in under a minute
- **Weight** — log daily body weight in kg, view week/month/all-time trend graph
- **Plan** — manage medications (dosage, times per day, adherence history), PT exercises (custom, with completion history and pain notes), and habits (with streak tracking)
- **Overview** — weekly pain/sleep/adherence trends, a plain-language "how's my recovery going" summary, weight trend, and habit streaks at a glance
- **Settings** — export a local JSON backup

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
