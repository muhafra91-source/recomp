import { useState } from 'react'
import { Flame, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { addDaysISO, daysAgoISO, formatShort, todayISO } from '../lib/date'

export function PlanHabits() {
  const habits = useStore((s) => s.habits)
  const habitLogs = useStore((s) => s.habitLogs)
  const addHabit = useStore((s) => s.addHabit)
  const deleteHabit = useStore((s) => s.deleteHabit)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  function submit() {
    if (!name.trim()) return
    addHabit(name.trim())
    setName('')
    setShowForm(false)
  }

  const today = todayISO()
  const last14 = Array.from({ length: 14 }, (_, i) => daysAgoISO(13 - i))

  function streakFor(habitId: string): number {
    const doneDates = new Set(habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date))
    let cursor = doneDates.has(today) ? today : daysAgoISO(1)
    if (!doneDates.has(cursor)) return 0
    let streak = 0
    while (doneDates.has(cursor)) {
      streak++
      cursor = addDaysISO(cursor, -1)
    }
    return streak
  }

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <Card>
          <SectionTitle>Add habit</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <Input
              label="Name"
              placeholder="e.g. Stretching"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <div className="flex gap-2 mt-1">
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={submit} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 w-full">
          <Plus size={18} /> Add habit
        </Button>
      )}

      <Card>
        <SectionTitle>Habits & streaks</SectionTitle>
        {habits.length === 0 ? (
          <EmptyState text="No habits added yet." />
        ) : (
          <ul className="flex flex-col gap-4">
            {habits.map((h) => {
              const doneDates = new Set(habitLogs.filter((l) => l.habitId === h.id).map((l) => l.date))
              return (
                <li key={h.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-white truncate">{h.name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Flame size={13} /> {streakFor(h.id)}
                      </span>
                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="text-slate-500 active:text-red-400"
                        aria-label={`Delete ${h.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {last14.map((date) => (
                      <div
                        key={date}
                        title={`${formatShort(date)}: ${doneDates.has(date) ? 'done' : 'not done'}`}
                        className={`flex-1 h-4 rounded ${doneDates.has(date) ? 'bg-teal-500' : 'bg-slate-800'}`}
                      />
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
