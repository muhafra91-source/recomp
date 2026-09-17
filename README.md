# Mend

A personal recovery and habit tracker for post-surgery recovery alongside fitness goals.

## Features

- **Today** — a single daily hub with a date navigator (log or edit any past day, not just today): sleep/pain/energy check-in with an optional note, quick weight log, and checklists for medications, PT exercises, and habits — all in under a minute
- **Appointments** — a month calendar with appointment days marked (tap a day to filter), plus upcoming/past lists; the next one also surfaces as a banner on Today
- **Plan** — manage medications (dosage, times per day, adherence history), PT exercises (custom, with completion history and pain notes), and habits (with streak tracking) — each editable in place, not just delete-and-recreate
- **Overview** — a weekly recovery score (0-100, combining sleep, pain trend, medication adherence, and habit completion) with an 8-week trend chart, an auto-generated weekly recap, a color-coded calendar heatmap of daily check-ins, pain/weight trends (week/month/all-time, with full history), habit streaks, and a milestone timeline
- **Settings** — set a surgery date to show a "Day X" post-op counter on Today and Overview, and export a local JSON backup

Hitting a habit streak milestone (3, 7, 14, 30, 60, or 100 days) triggers a small confetti celebration. Every delete (medications, exercises, habits, appointments, weight entries, milestones) gives you a few seconds to undo before it's committed.

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
