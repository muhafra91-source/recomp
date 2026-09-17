import { useState } from 'react'
import { Flame, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { UndoBar } from '../components/UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { daysAgoISO, formatShort, todayISO } from '../lib/date'
import { habitStreak } from '../lib/scoring'

export function PlanHabits() {
  const habits = useStore((s) => s.habits)
  const habitLogs = useStore((s) => s.habitLogs)
  const addHabit = useStore((s) => s.addHabit)
  const updateHabit = useStore((s) => s.updateHabit)
  const deleteHabit = useStore((s) => s.deleteHabit)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')

  const { pending, requestDelete, undo, isPending } = useUndoableDelete(deleteHabit)

  function startAdd() {
    setEditingId(null)
    setName('')
    setShowForm(true)
  }

  function startEdit(id: string, currentName: string) {
    setEditingId(id)
    setName(currentName)
    setShowForm(true)
  }

  function submit() {
    if (!name.trim()) return
    if (editingId) {
      updateHabit(editingId, name.trim())
    } else {
      addHabit(name.trim())
    }
    setName('')
    setEditingId(null)
    setShowForm(false)
  }

  const today = todayISO()
  const last14 = Array.from({ length: 14 }, (_, i) => daysAgoISO(13 - i))
  const visibleHabits = habits.filter((h) => !isPending(h.id))

  return (
    <div className="flex flex-col gap-4">
      {pending && <UndoBar label={`Deleted ${pending.label}`} onUndo={undo} />}

      {showForm ? (
        <Card>
          <SectionTitle>{editingId ? 'Edit habit' : 'Add habit'}</SectionTitle>
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
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={submit} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={startAdd} className="flex items-center justify-center gap-2 w-full">
          <Plus size={18} /> Add habit
        </Button>
      )}

      <Card>
        <SectionTitle>Habits & streaks</SectionTitle>
        {visibleHabits.length === 0 ? (
          <EmptyState text="No habits added yet." />
        ) : (
          <ul className="flex flex-col gap-4">
            {visibleHabits.map((h) => {
              const doneDates = new Set(habitLogs.filter((l) => l.habitId === h.id).map((l) => l.date))
              return (
                <li key={h.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-white truncate">{h.name}</p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                        <Flame size={13} /> {habitStreak(habitLogs, h.id, today)}
                      </span>
                      <button
                        onClick={() => startEdit(h.id, h.name)}
                        className="text-slate-500 active:text-teal-400"
                        aria-label={`Edit ${h.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => requestDelete(h.id, h.name)}
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
                        className={`flex-1 h-4 rounded-md transition-transform duration-150 hover:scale-110 ${doneDates.has(date) ? 'bg-emerald-500' : 'bg-slate-800'}`}
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
