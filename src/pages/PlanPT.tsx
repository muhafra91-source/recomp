import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { formatDateLabel } from '../lib/date'

const emptyForm = { name: '', target: '' }

export function PlanPT() {
  const ptExercises = useStore((s) => s.ptExercises)
  const ptLogs = useStore((s) => s.ptLogs)
  const addPTExercise = useStore((s) => s.addPTExercise)
  const deletePTExercise = useStore((s) => s.deletePTExercise)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function submit() {
    if (!form.name.trim()) return
    addPTExercise(form.name.trim(), form.target.trim() || undefined)
    setForm(emptyForm)
    setShowForm(false)
  }

  const exerciseById = useMemo(() => new Map(ptExercises.map((e) => [e.id, e])), [ptExercises])
  const grouped = useMemo(() => {
    const map = new Map<string, typeof ptLogs>()
    for (const l of [...ptLogs].sort((a, b) => b.date.localeCompare(a.date))) {
      const list = map.get(l.date) ?? []
      list.push(l)
      map.set(l.date, list)
    }
    return [...map.entries()].slice(0, 14)
  }, [ptLogs])

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <Card>
          <SectionTitle>Add exercise</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <Input
              label="Name"
              placeholder="e.g. Shoulder Rolls"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <Input
              label="Target (optional)"
              placeholder="e.g. 3x10 or 10 min"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
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
          <Plus size={18} /> Add exercise
        </Button>
      )}

      <Card>
        <SectionTitle>Exercises</SectionTitle>
        {ptExercises.length === 0 ? (
          <EmptyState text="No exercises added yet." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {ptExercises.map((ex) => (
              <li key={ex.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ex.name}</p>
                  {ex.target && <p className="text-xs text-slate-500">{ex.target}</p>}
                </div>
                <button
                  onClick={() => deletePTExercise(ex.id)}
                  className="text-slate-500 active:text-red-400 shrink-0"
                  aria-label={`Delete ${ex.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>History</SectionTitle>
        {grouped.length === 0 ? (
          <EmptyState text="No exercises logged yet." />
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([date, logs]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-slate-400 mb-2">{formatDateLabel(date)}</p>
                <ul className="flex flex-col gap-2">
                  {logs.map((l) => (
                    <li key={l.id} className="bg-slate-900/60 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-white">
                        {exerciseById.get(l.exerciseId)?.name ?? 'Unknown'}
                      </p>
                      {(l.detail || l.painNote) && (
                        <p className="text-xs text-slate-500">
                          {[l.detail, l.painNote].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
