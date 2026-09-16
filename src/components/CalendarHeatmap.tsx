import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CheckIn } from '../types'
import { dayScore, scoreColor } from '../lib/scoring'
import { todayISO } from '../lib/date'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function CalendarHeatmap({ checkIns }: { checkIns: CheckIn[] }) {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const checkInByDate = new Map(checkIns.map((c) => [c.date, c]))
  const today = todayISO()

  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const startWeekday = firstOfMonth.getDay()

  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(`${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`)
  }

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const isCurrentMonth = now.getFullYear() === cursor.year && now.getMonth() === cursor.month

  function prevMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
  }
  function nextMonth() {
    if (isCurrentMonth) return
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="p-1.5 rounded-lg text-slate-400 active:text-white active:bg-slate-800 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-slate-200">{monthLabel}</span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="p-1.5 rounded-lg text-slate-400 active:text-white active:bg-slate-800 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-500">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />
          const score = dayScore(checkInByDate.get(date))
          const isToday = date === today
          const dayNum = parseInt(date.slice(-2), 10)
          return (
            <div
              key={date}
              title={score !== null ? `${date}: ${score}/100` : `${date}: no check-in`}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold transition-transform duration-150 hover:scale-110 ${scoreColor(score)} ${
                isToday ? 'ring-2 ring-white/70' : ''
              } ${score !== null ? 'text-slate-900' : 'text-slate-600'}`}
            >
              {dayNum}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-slate-500">
        <span>Rough</span>
        <div className="flex gap-1">
          {['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'].map((c) => (
            <div key={c} className={`w-3.5 h-3.5 rounded ${c}`} />
          ))}
        </div>
        <span>Great</span>
      </div>
    </div>
  )
}
