import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle, Select } from '../components/ui'
import { formatDateLabel, formatShort, todayISO } from '../lib/date'

type SetRow = { reps: string; weight: string }
type SubView = 'history' | 'progress'

export function WorkoutsPage() {
  const exercises = useStore((s) => s.exercises)
  const workouts = useStore((s) => s.workouts)
  const addExercise = useStore((s) => s.addExercise)
  const addWorkout = useStore((s) => s.addWorkout)
  const deleteWorkout = useStore((s) => s.deleteWorkout)

  const [showForm, setShowForm] = useState(false)
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? '')
  const [newExerciseName, setNewExerciseName] = useState('')
  const [addingExercise, setAddingExercise] = useState(false)
  const [sets, setSets] = useState<SetRow[]>([{ reps: '', weight: '' }])
  const [sub, setSub] = useState<SubView>('history')
  const [progressExerciseId, setProgressExerciseId] = useState(exercises[0]?.id ?? '')

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof workouts>()
    for (const w of [...workouts].sort((a, b) => b.date.localeCompare(a.date))) {
      const list = map.get(w.date) ?? []
      list.push(w)
      map.set(w.date, list)
    }
    return [...map.entries()]
  }, [workouts])

  const progressData = useMemo(() => {
    return workouts
      .filter((w) => w.exerciseId === progressExerciseId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((w) => ({
        date: formatShort(w.date),
        topWeight: Math.max(0, ...w.sets.map((s) => s.weight)),
      }))
  }, [workouts, progressExerciseId])

  function updateSet(i: number, key: keyof SetRow, val: string) {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)))
  }

  function submit() {
    const parsed = sets
      .map((s) => ({ reps: parseInt(s.reps, 10), weight: parseFloat(s.weight) }))
      .filter((s) => Number.isFinite(s.reps) && s.reps > 0 && Number.isFinite(s.weight))
    if (!exerciseId || parsed.length === 0) return
    addWorkout(todayISO(), exerciseId, parsed)
    setSets([{ reps: '', weight: '' }])
    setShowForm(false)
  }

  function createExercise() {
    const name = newExerciseName.trim()
    if (!name) return
    const ex = addExercise(name)
    setExerciseId(ex.id)
    setNewExerciseName('')
    setAddingExercise(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Workouts</h1>

      {showForm ? (
        <Card>
          <SectionTitle>Log workout</SectionTitle>
          <div className="flex flex-col gap-3">
            {addingExercise ? (
              <div className="flex gap-2 items-end">
                <Input
                  label="New exercise"
                  placeholder="e.g. Leg Press"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  autoFocus
                />
                <Button onClick={createExercise} className="shrink-0">
                  Add
                </Button>
                <button
                  onClick={() => setAddingExercise(false)}
                  className="text-slate-500 p-2 shrink-0"
                  aria-label="Cancel new exercise"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <Select label="Exercise" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </Select>
                <Button
                  variant="secondary"
                  onClick={() => setAddingExercise(true)}
                  className="shrink-0"
                  aria-label="Add new exercise"
                >
                  <Plus size={18} />
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-400">Sets</span>
              {sets.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="reps"
                    value={s.reps}
                    onChange={(e) => updateSet(i, 'reps', e.target.value)}
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="lbs"
                    value={s.weight}
                    onChange={(e) => updateSet(i, 'weight', e.target.value)}
                  />
                  <button
                    onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={sets.length === 1}
                    className="text-slate-500 active:text-red-400 disabled:opacity-30 shrink-0"
                    aria-label={`Remove set ${i + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={() => setSets((prev) => [...prev, { reps: prev.at(-1)?.reps ?? '', weight: prev.at(-1)?.weight ?? '' }])}
                className="flex items-center justify-center gap-1 self-start"
              >
                <Plus size={14} /> Add set
              </Button>
            </div>

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
          <Plus size={18} /> Log workout
        </Button>
      )}

      <div className="flex gap-1 bg-slate-900 rounded-lg p-1 w-fit">
        {(['history', 'progress'] as SubView[]).map((v) => (
          <button
            key={v}
            onClick={() => setSub(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize ${
              sub === v ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {sub === 'history' && (
        <Card>
          {grouped.length === 0 ? (
            <EmptyState text="No workouts logged yet." />
          ) : (
            <div className="flex flex-col gap-4">
              {grouped.map(([date, entries]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-slate-400 mb-2">{formatDateLabel(date)}</p>
                  <ul className="flex flex-col gap-2">
                    {entries.map((w) => (
                      <li
                        key={w.id}
                        className="flex items-center justify-between bg-slate-900/60 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {exerciseById.get(w.exerciseId)?.name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {w.sets.map((s) => `${s.reps}×${s.weight}`).join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWorkout(w.id)}
                          className="text-slate-500 active:text-red-400 shrink-0"
                          aria-label={`Delete ${exerciseById.get(w.exerciseId)?.name ?? 'workout'} entry`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {sub === 'progress' && (
        <Card>
          <Select
            label="Exercise"
            value={progressExerciseId}
            onChange={(e) => setProgressExerciseId(e.target.value)}
            className="mb-4"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </Select>
          {progressData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="topWeight" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="Log this exercise a few times to see progress." />
          )}
        </Card>
      )}
    </div>
  )
}
