import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Appointment } from '../types'
import { todayISO } from '../lib/date'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function AppointmentCalendar({
  appointments,
  selectedDay,
  onSelectDay,
}: {
  appointments: Appointment[]
  selectedDay: string | null
  onSelectDay: (date: string | null) => void
}) {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const apptDates = new Set(appointments.map((a) => a.date))
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

  function prevMonth() {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
  }
  function nextMonth() {
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
          aria-label="Next month"
          className="p-1.5 rounded-lg text-slate-400 active:text-white active:bg-slate-800 transition-colors"
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
          const hasAppt = apptDates.has(date)
          const isToday = date === today
          const isSelected = date === selectedDay
          const dayNum = parseInt(date.slice(-2), 10)
          return (
            <button
              key={date}
              onClick={() => onSelectDay(isSelected ? null : hasAppt ? date : null)}
              disabled={!hasAppt}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-[11px] font-medium transition-all duration-150 ${
                hasAppt ? 'active:scale-90' : 'cursor-default'
              } ${
                isSelected
                  ? 'bg-teal-500 text-slate-900 font-semibold'
                  : hasAppt
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'bg-slate-800/60 text-slate-500'
              } ${isToday && !isSelected ? 'ring-2 ring-white/40' : ''}`}
            >
              {dayNum}
              {hasAppt && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400" />
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <button
          onClick={() => onSelectDay(null)}
          className="mt-3 text-xs font-medium text-teal-400 active:text-teal-300 transition-colors"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
