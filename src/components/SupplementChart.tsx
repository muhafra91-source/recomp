import { useState } from 'react'
import type { Supplement, SupplementLog } from '../types'
import { daysAgoISO, formatShort, todayISO } from '../lib/date'

type Range = 7 | 14 | 30

/** Grid of supplements (rows) × days (columns), filled where taken, with a per-supplement total. */
export function SupplementChart({ supplements, logs }: { supplements: Supplement[]; logs: SupplementLog[] }) {
  const [range, setRange] = useState<Range>(14)
  const today = todayISO()
  const days = Array.from({ length: range }, (_, i) => daysAgoISO(range - 1 - i))
  const taken = new Set(logs.map((l) => `${l.supplementId}|${l.date}`))

  return (
    <div>
      <div className="flex justify-end mb-3">
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
          {([7, 14, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                range === r ? 'bg-teal-500 text-slate-900' : 'text-slate-400'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-3">
        {supplements.map((s) => {
          const count = days.filter((d) => taken.has(`${s.id}|${d}`)).length
          const pct = Math.round((count / range) * 100)
          return (
            <li key={s.id}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm text-slate-300 truncate">{s.name}</span>
                <span className="text-xs font-semibold text-teal-400 shrink-0">
                  {count}/{range} · {pct}%
                </span>
              </div>
              <div className="flex gap-[2px]">
                {days.map((date) => {
                  const on = taken.has(`${s.id}|${date}`)
                  return (
                    <div
                      key={date}
                      title={`${formatShort(date)}: ${on ? 'taken' : 'not taken'}`}
                      className={`flex-1 h-4 rounded-sm ${on ? 'bg-teal-500' : 'bg-slate-800'} ${
                        date === today ? 'ring-1 ring-white/60' : ''
                      }`}
                    />
                  )
                })}
              </div>
            </li>
          )
        })}
      </ul>

      <div className="flex justify-between mt-2 text-[10px] text-slate-500">
        <span>{formatShort(days[0])}</span>
        <span>Today</span>
      </div>
    </div>
  )
}
