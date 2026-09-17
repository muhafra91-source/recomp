import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Flame, Pill } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, ScalePicker, SectionTitle, Textarea } from '../components/ui'
import { StreakToast } from '../components/Toast'
import { PostOpBadge } from '../components/PostOpBadge'
import { addDaysISO, formatDateLabel, todayISO } from '../lib/date'
import { STREAK_MILESTONES, habitStreak } from '../lib/scoring'
import { fireConfetti } from '../lib/confetti'
import { parseDecimal } from '../lib/number'

export function TodayPage() {
  const today = todayISO()
  const [selectedDate, setSelectedDate] = useState(today)

  const checkIns = useStore((s) => s.checkIns)
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

  const appointments = useStore((s) => s.appointments)
  const nextAppointment = useMemo(
    () =>
      [...appointments]
        .filter((a) => a.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))[0],
    [appointments, today],
  )

  const [sleepHours, setSleepHours] = useState('')
  const [sleepQuality, setSleepQuality] = useState<number | undefined>(undefined)
  const [pain, setPain] = useState<number | undefined>(undefined)
  const [energy, setEnergy] = useState<number | undefined>(undefined)
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [saved, setSaved] = useState(false)

  const [weightValue, setWeightValue] = useState('')
  const [expandedPT, setExpandedPT] = useState<string | null>(null)
  const [ptDetail, setPtDetail] = useState('')
  const [ptPain, setPtPain] = useState('')

  const [toast, setToast] = useState<string | null>(null)

  // Re-hydrate the draft form fields whenever the viewed date changes.
  useEffect(() => {
    const c = checkIns.find((c) => c.date === selectedDate)
    setSleepHours(c?.sleepHours?.toString() ?? '')
    setSleepQuality(c?.sleepQuality)
    setPain(c?.pain)
    setEnergy(c?.energy)
    setNotes(c?.notes ?? '')
    setShowNotes(!!c?.notes)
    setWeightValue('')
    setExpandedPT(null)
    setPtDetail('')
    setPtPain('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const dateWeight = weights.find((w) => w.date === selectedDate)

  function saveCheckInNow() {
    saveCheckIn(selectedDate, {
      sleepHours: sleepHours ? parseDecimal(sleepHours) : undefined,
      sleepQuality,
      pain,
      energy,
      notes: notes.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function saveWeight() {
    const n = parseDecimal(weightValue)
    if (!Number.isFinite(n) || n <= 0) return
    addWeight(selectedDate, n)
    setWeightValue('')
  }

  function toggleExercise(exerciseId: string) {
    const log = ptLogs.find((l) => l.date === selectedDate && l.exerciseId === exerciseId)
    if (log) {
      unlogPT(selectedDate, exerciseId)
      if (expandedPT === exerciseId) setExpandedPT(null)
    } else {
      logPT(selectedDate, exerciseId)
      setExpandedPT(exerciseId)
      setPtDetail('')
      setPtPain('')
    }
  }

  function saveExerciseDetail(exerciseId: string) {
    logPT(selectedDate, exerciseId, ptDetail.trim() || undefined, ptPain.trim() || undefined)
    setExpandedPT(null)
  }

  function handleToggleHabit(habitId: string, habitName: string) {
    const wasDone = habitLogs.some((l) => l.date === selectedDate && l.habitId === habitId)
    toggleHabit(selectedDate, habitId)
    if (!wasDone) {
      const simulatedLogs = [...habitLogs, { id: 'pending', date: selectedDate, habitId }]
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">Today</h1>
          <PostOpBadge />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedDate((d) => addDaysISO(d, -1))}
            className="p-1.5 text-slate-400 active:text-white transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-300 w-28 text-center">
            {formatDateLabel(selectedDate)}
          </span>
          <button
            onClick={() => setSelectedDate((d) => addDaysISO(d, 1))}
            disabled={selectedDate >= today}
            className="p-1.5 text-slate-400 active:text-white transition-colors disabled:opacity-30"
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {nextAppointment && (
        <Card className="flex items-center gap-3 bg-teal-500/10 border-teal-500/30">
          <span className="w-9 h-9 rounded-full bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0">
            <CalendarClock size={16} className="text-teal-400" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{nextAppointment.title}</p>
            <p className="text-xs text-slate-400">
              {formatDateLabel(nextAppointment.date)}
              {nextAppointment.time ? ` · ${nextAppointment.time}` : ''}
              {nextAppointment.provider ? ` · ${nextAppointment.provider}` : ''}
            </p>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle>Check-in</SectionTitle>
        <div className="flex flex-col gap-4">
          <Input
            label="Sleep hours"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
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
              placeholder="Anything worth flagging that day..."
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
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            placeholder={dateWeight ? String(dateWeight.weight) : 'e.g. 75.0'}
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveWeight()}
          />
          <Button onClick={saveWeight} className="shrink-0">
            {dateWeight ? 'Update' : 'Log'}
          </Button>
        </div>
        {dateWeight && (
          <p className="text-xs text-slate-500 mt-2">
            {formatDateLabel(selectedDate)}: {dateWeight.weight} kg
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle>Medications</SectionTitle>
        {medications.length === 0 ? (
          <EmptyState text="No medications added yet. Add them in Plan." />
        ) : (
          <ul className="flex flex-col gap-3">
            {medications.map((med) => {
              const count = medLogs.filter(
                (l) => l.medicationId === med.id && l.date === selectedDate,
              ).length
              return (
                <li key={med.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{med.name}</p>
                    <p className="text-xs text-slate-500">
                      {med.dosage} · {count}/{med.timesPerDay}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {Array.from({ length: med.timesPerDay }, (_, i) => i).map((i) => {
                      const taken = i < count
                      return (
                        <button
                          key={i}
                          onClick={() =>
                            taken ? undoMedDose(med.id, selectedDate) : logMedDose(med.id, selectedDate)
                          }
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
              const log = ptLogs.find((l) => l.date === selectedDate && l.exerciseId === ex.id)
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
              const done = habitLogs.some((l) => l.date === selectedDate && l.habitId === h.id)
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
