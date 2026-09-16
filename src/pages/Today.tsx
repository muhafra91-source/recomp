import { useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronUp, Flame, Pill } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, ScalePicker, SectionTitle, Textarea } from '../components/ui'
import { StreakToast } from '../components/Toast'
import { todayISO } from '../lib/date'
import { STREAK_MILESTONES, habitStreak } from '../lib/scoring'
import { fireConfetti } from '../lib/confetti'

export function TodayPage() {
  const today = todayISO()

  const checkIn = useStore((s) => s.checkIns.find((c) => c.date === today))
  const saveCheckIn = useStore((s) => s.saveCheckIn)

  const weights = useStore((s) => s.weights)
  const addWeight = useStore((s) => s.addWeight)

  const allMedications = useStore((s) => s.medications)
  const medLogs = useStore((s) => s.medLogs)
  const logMedDose = useStore((s) => s.logMedDose)
  const undoMedDose = useStore((s) => s.undoMedDose)
  const medications = useMemo(() => allMedications.filter((m) => !m.archived), [allMedications])

  const allPTExercises = useStore((s) => s.ptExercises)
  const ptLogs = useStore((s) => s.ptLogs)
  const logPT = useStore((s) => s.logPT)
  const unlogPT = useStore((s) => s.unlogPT)
  const ptExercises = useMemo(() => allPTExercises.filter((e) => !e.archived), [allPTExercises])

  const allHabits = useStore((s) => s.habits)
  const habitLogs = useStore((s) => s.habitLogs)
  const toggleHabit = useStore((s) => s.toggleHabit)
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits])

  const [sleepHours, setSleepHours] = useState(checkIn?.sleepHours?.toString() ?? '')
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(checkIn?.sleepQuality)
  const [pain, setPain] = useState<number | undefined>(checkIn?.pain)
  const [energy, setEnergy] = useState<number | undefined>(checkIn?.energy)
  const [notes, setNotes] = useState(checkIn?.notes ?? '')
  const [showNotes, setShowNotes] = useState(!!checkIn?.notes)
  const [saved, setSaved] = useState(false)

  const [weightValue, setWeightValue] = useState('')
  const todayWeight = weights.find((w) => w.date === today)

  const [expandedPT, setExpandedPT] = useState<string | null>(null)
  const [ptDetail, setPtDetail] = useState('')
  const [ptPain, setPtPain] = useState('')

  const [toast, setToast] = useState<string | null>(null)

  function saveCheckInNow() {
    saveCheckIn(today, {
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      sleepQuality,
      pain,
      energy,
      notes: notes.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function saveWeight() {
    const n = parseFloat(weightValue)
    if (!Number.isFinite(n) || n <= 0) return
    addWeight(today, n)
    setWeightValue('')
  }

  function toggleExercise(exerciseId: string) {
    const log = ptLogs.find((l) => l.date === today && l.exerciseId === exerciseId)
    if (log) {
      unlogPT(today, exerciseId)
      if (expandedPT === exerciseId) setExpandedPT(null)
    } else {
      logPT(today, exerciseId)
      setExpandedPT(exerciseId)
      setPtDetail('')
      setPtPain('')
    }
  }

  function saveExerciseDetail(exerciseId: string) {
    logPT(today, exerciseId, ptDetail.trim() || undefined, ptPain.trim() || undefined)
    setExpandedPT(null)
  }

  function handleToggleHabit(habitId: string, habitName: string) {
    const wasDone = habitLogs.some((l) => l.date === today && l.habitId === habitId)
    toggleHabit(today, habitId)
    if (!wasDone) {
      const simulatedLogs = [...habitLogs, { id: 'pending', date: today, habitId }]
      const newStreak = habitStreak(simulatedLogs, habitId, today)
      if (STREAK_MILESTONES.includes(newStreak)) {
        fireConfetti()
        setToast(`${newStreak}-day streak on ${habitName}! 🎉`)
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {toast && <StreakToast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h1 className="text-xl font-bold text-white">Today</h1>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card>
        <SectionTitle>Check-in</SectionTitle>
        <div className="flex flex-col gap-4">
          <Input
            label="Sleep hours"
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="e.g. 7.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
          <ScalePicker label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} max={5} />
          <ScalePicker label="Pain level" value={pain} onChange={setPain} max={10} colorScale />
          <ScalePicker label="Energy level" value={energy} onChange={setEnergy} max={10} />

          {showNotes ? (
            <Textarea
              label="Notes"
              placeholder="Anything worth flagging today..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs font-medium text-teal-400 text-left transition-colors active:text-teal-300"
            >
              + Add a note
            </button>
          )}

          <Button onClick={saveCheckInNow}>{saved ? 'Saved ✓' : 'Save check-in'}</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Weight</SectionTitle>
        <div className="flex gap-2 items-end">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={todayWeight ? String(todayWeight.weight) : 'e.g. 75.0'}
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveWeight()}
          />
          <Button onClick={saveWeight} className="shrink-0">
            {todayWeight ? 'Update' : 'Log'}
          </Button>
        </div>
        {todayWeight && <p className="text-xs text-slate-500 mt-2">Today: {todayWeight.weight} kg</p>}
      </Card>

      <Card>
        <SectionTitle>Medications</SectionTitle>
        {medications.length === 0 ? (
          <EmptyState text="No medications added yet. Add them in Plan." />
        ) : (
          <ul className="flex flex-col gap-3">
            {medications.map((med) => {
              const count = medLogs.filter((l) => l.medicationId === med.id && l.date === today).length
              return (
                <li key={med.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{med.name}</p>
                    <p className="text-xs text-slate-500">
                      {med.dosage} · {count}/{med.timesPerDay} today
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {Array.from({ length: med.timesPerDay }, (_, i) => i).map((i) => {
                      const taken = i < count
                      return (
                        <button
                          key={i}
                          onClick={() => (taken ? undoMedDose(med.id, today) : logMedDose(med.id, today))}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-90 ${
                            taken ? 'bg-teal-500 text-slate-900 animate-pop' : 'bg-slate-800 text-slate-500'
                          }`}
                          aria-label={taken ? `Undo dose ${i + 1} of ${med.name}` : `Log dose ${i + 1} of ${med.name}`}
                        >
                          <Pill size={14} />
                        </button>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>PT exercises</SectionTitle>
        {ptExercises.length === 0 ? (
          <EmptyState text="No exercises added yet. Add them in Plan." />
        ) : (
          <ul className="flex flex-col gap-2">
            {ptExercises.map((ex) => {
              const log = ptLogs.find((l) => l.date === today && l.exerciseId === ex.id)
              const done = !!log
              const expanded = expandedPT === ex.id
              return (
                <li key={ex.id} className="rounded-2xl bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(ex.id)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 transition-colors active:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                          done ? 'bg-teal-500 text-slate-900 animate-pop' : 'border-2 border-slate-600'
                        }`}
                      >
                        {done && <Check size={14} strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 text-left">
                        <p className={`text-sm font-medium truncate ${done ? 'text-white' : 'text-slate-300'}`}>
                          {ex.name}
                        </p>
                        {ex.target && <p className="text-xs text-slate-500">{ex.target}</p>}
                      </div>
                    </div>
                    {done && (expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />)}
                  </button>
                  {done && expanded && (
                    <div className="flex flex-col gap-2 px-3 pb-3 animate-fade-in-up">
                      <Input
                        label="Sets/reps or duration"
                        placeholder="e.g. 3x10 or 10 min"
                        value={ptDetail}
                        onChange={(e) => setPtDetail(e.target.value)}
                      />
                      <Input
                        label="Difficulty / pain note"
                        placeholder="e.g. mild pinch at end range"
                        value={ptPain}
                        onChange={(e) => setPtPain(e.target.value)}
                      />
                      <Button variant="secondary" onClick={() => saveExerciseDetail(ex.id)}>
                        Save details
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>Habits</SectionTitle>
        {habits.length === 0 ? (
          <EmptyState text="No habits added yet. Add them in Plan." />
        ) : (
          <ul className="flex flex-col gap-2">
            {habits.map((h) => {
              const done = habitLogs.some((l) => l.date === today && l.habitId === h.id)
              const streak = habitStreak(habitLogs, h.id, today)
              return (
                <li key={h.id}>
                  <button
                    onClick={() => handleToggleHabit(h.id, h.name)}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl bg-slate-900/60 px-3 py-2.5 transition-colors active:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                          done ? 'bg-teal-500 text-slate-900 animate-pop' : 'border-2 border-slate-600'
                        }`}
                      >
                        {done && <Check size={14} strokeWidth={3} />}
                      </span>
                      <span className={`text-sm font-medium truncate ${done ? 'text-white' : 'text-slate-300'}`}>
                        {h.name}
                      </span>
                    </div>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 shrink-0">
                        <Flame size={13} /> {streak}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
