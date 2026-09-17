# Mend

A personal recovery and habit tracker for post-surgery recovery alongside fitness goals.

## Features

- **Today** — a single daily hub with a date navigator (log or edit any past day, not just today): sleep/pain/energy check-in with an optional note, quick weight log, and checklists for medications, PT exercises, and habits — all in under a minute
- **Appointments** — a month calendar with appointment days marked (tap a day to filter), plus upcoming/past lists; the next one also surfaces as a banner on Today
- **Plan** — manage medications (dosage, times per day, adherence history), PT exercises (custom, with completion history and pain notes), and habits (with streak tracking)
- **Overview** — a weekly recovery score (0-100, combining sleep, pain trend, medication adherence, and habit completion), an auto-generated weekly recap, a color-coded calendar heatmap of daily check-ins, pain/weight trends (week/month/all-time, with full history), habit streaks, and a milestone timeline
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
