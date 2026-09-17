import { useStore } from '../store'
import { daysBetween, todayISO } from '../lib/date'

export function PostOpBadge() {
  const surgeryDate = useStore((s) => s.surgeryDate)
  if (!surgeryDate) return null

  const day = daysBetween(surgeryDate, todayISO())
  const label = day >= 0 ? `Day ${day}` : `Surgery in ${-day}d`

  return (
    <span className="inline-flex items-center rounded-full bg-teal-500/15 border border-teal-500/40 px-2.5 py-1 text-xs font-semibold text-teal-300">
      {label}
    </span>
  )
}
