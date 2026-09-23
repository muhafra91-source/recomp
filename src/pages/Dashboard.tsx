import { useMemo, useState } from 'react'
import { Flame, Heart, Moon, Pill, Scale, Trash2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Card, EmptyState, SectionTitle, StatTile } from '../components/ui'
import { CalendarHeatmap } from '../components/CalendarHeatmap'
import { SupplementChart } from '../components/SupplementChart'
import { MilestoneTimeline } from '../components/MilestoneTimeline'
import { PostOpBadge } from '../components/PostOpBadge'
import { UndoBar } from '../components/UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { daysAgoISO, formatDateLabel, formatShort, isWithinDays, todayISO } from '../lib/date'
import { habitStreak, scoreHex, weeklyRecap, weeklyRecoveryScore } from '../lib/scoring'
import type { Tab } from '../App'
import type { DateRange } from '../types'

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function Dashboard({ onNavigate: _onNavigate }: { onNavigate: (t: Tab) => void }) {
  const checkIns = useStore((s) => s.checkIns)
  const weights = useStore((s) => s.weights)
  const deleteWeight = useStore((s) => s.deleteWeight)
  const allMedications = useStore((s) => s.medications)
  const medLogs = useStore((s) => s.medLogs)
  const allHabits = useStore((s) => s.habits)
  const habitLogs = useStore((s) => s.habitLogs)
  const ptLogs = useStore((s) => s.ptLogs)
  const allSupplements = useStore((s) => s.supplements)
  const supplementLogs = useStore((s) => s.supplementLogs)

  const medications = useMemo(() => allMedications.filter((m) => !m.archived), [allMedications])
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits])
  const supplements = useMemo(() => allSupplements.filter((s) => !s.archived), [allSupplements])

  const [weightRange, setWeightRange] = useState<DateRange>('month')
  const [showWeightHistory, setShowWeightHistory] = useState(false)
  const { pending: pendingWeight, requestDelete: requestDeleteWeight, undo: undoDeleteWeight, isPending: isWeightPending } = useUndoableDelete(deleteWeight)

  const today = todayISO()

  const weeklyScore = useMemo(
    () => weeklyRecoveryScore(today, { checkIns, medications, medLogs, habits, habitLogs }),
    [today, checkIns, medications, medLogs, habits, habitLogs],
  )

  const scoreHistory = useMemo(() => {
    const weeks: { label: string; score: number | null }[] = []
    for (let i = 7; i >= 0; i--) {
      const end = daysAgoISO(i * 7)
      const { score } = weeklyRecoveryScore(end, { checkIns, medications, medLogs, habits, habitLogs })
      weeks.push({ label: formatShort(end), score })
    }
    return weeks
  }, [checkIns, medications, medLogs, habits, habitLogs])

  const recap = useMemo(
    () =>
      weeklyRecap(today, {
        checkIns,
        weights,
        medications,
        medLogs,
        ptLogDates: ptLogs.map((l) => l.date),
        habits,
        habitLogs,
      }),
    [today, checkIns, weights, medications, medLogs, ptLogs, habits, habitLogs],
  )

  const last7Pain = useMemo(
    () =>
      average(
        checkIns.filter((c) => isWithinDays(c.date, 7) && c.pain !== undefined).map((c) => c.pain!),
      ),
    [checkIns],
  )
  const avgSleep7 = useMemo(
    () =>
      average(
        checkIns.filter((c) => isWithinDays(c.date, 7) && c.sleepHours !== undefined).map((c) => c.sleepHours!),
      ),
    [checkIns],
  )

  const latestWeight = useMemo(
    () => [...weights].sort((a, b) => b.date.localeCompare(a.date))[0],
    [weights],
  )

  const painChartData = useMemo(() => {
    const days: { date: string; pain: number | null }[] = []
    for (let i = 13; i >= 0; i--) {
      const date = daysAgoISO(i)
      const c = checkIns.find((c) => c.date === date)
      days.push({ date: formatShort(date), pain: c?.pain ?? null })
    }
    return days
  }, [checkIns])

  const sortedWeights = useMemo(
    () => weights.filter((w) => !isWeightPending(w.id)).sort((a, b) => a.date.localeCompare(b.date)),
    [weights, isWeightPending],
  )
  const weightChartData = useMemo(() => {
    const filtered =
      weightRange === 'all'
        ? sortedWeights
        : sortedWeights.filter((w) => isWithinDays(w.date, weightRange === 'week' ? 7 : 30))
    return filtered.map((w) => ({ date: formatShort(w.date), weight: w.weight }))
  }, [sortedWeights, weightRange])

  const scorePct = weeklyScore.score ?? 0
  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference * (1 - scorePct / 100)

  return (
    <div className="flex flex-col gap-5">
      {pendingWeight && <UndoBar label={`Deleted ${pendingWeight.label}`} onUndo={undoDeleteWeight} />}

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">Overview</h1>
          <PostOpBadge />
        </div>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card className="flex items-center gap-5">
        <div className="relative shrink-0 w-28 h-28">
          <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
            {weeklyScore.score !== null && (
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={scoreHex(weeklyScore.score)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{weeklyScore.score ?? '—'}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">of 100</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className="text-sm font-semibold text-white">Weekly recovery score</p>
          <p className="text-xs text-slate-400 leading-relaxed">{recap}</p>
        </div>
      </Card>

      <Card>
        <SectionTitle>Score trend (8 weeks)</SectionTitle>
        {scoreHistory.some((w) => w.score !== null) ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={scoreHistory} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {scoreHistory.map((w, i) => (
                  <Cell key={i} fill={scoreHex(w.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Keep logging to build up your score trend." />
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Latest weight"
          value={latestWeight ? `${latestWeight.weight} kg` : '—'}
          sub={latestWeight ? formatShort(latestWeight.date) : 'No entries yet'}
          icon={<Scale size={16} />}
        />
        <StatTile
          label="Avg pain (7d)"
          value={last7Pain !== null ? last7Pain.toFixed(1) : '—'}
          sub="out of 10"
          icon={<Heart size={16} />}
        />
        <StatTile
          label="Avg sleep (7d)"
          value={avgSleep7 !== null ? `${avgSleep7.toFixed(1)}h` : '—'}
          sub={weeklyScore.sleep !== null ? `Sleep score ${weeklyScore.sleep}` : 'No data yet'}
          icon={<Moon size={16} />}
        />
        <StatTile
          label="Med adherence"
          value={weeklyScore.medAdherence !== null ? `${weeklyScore.medAdherence}%` : '—'}
          sub="last 7 days"
          icon={<Pill size={16} />}
        />
      </div>

      <Card>
        <SectionTitle>Recovery calendar</SectionTitle>
        <CalendarHeatmap checkIns={checkIns} />
      </Card>

      <Card>
        <SectionTitle>Pain level (14d)</SectionTitle>
        {painChartData.some((d) => d.pain !== null) ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={painChartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="pain"
                stroke="#fb923c"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Log pain in your daily check-in to see this trend." />
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Weight trend</SectionTitle>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            {(['week', 'month', 'all'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setWeightRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors duration-200 ${
                  weightRange === r ? 'bg-teal-500 text-slate-900' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {weightChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightChartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Log weight daily to see your trend." />
        )}

        {sortedWeights.length > 0 && (
          <>
            <button
              onClick={() => setShowWeightHistory((v) => !v)}
              className="text-xs font-medium text-teal-400 active:text-teal-300 transition-colors mt-3"
            >
              {showWeightHistory ? 'Hide history' : `Show history (${sortedWeights.length})`}
            </button>
            {showWeightHistory && (
              <ul className="flex flex-col divide-y divide-slate-700/50 mt-2 animate-fade-in-up">
                {[...sortedWeights].reverse().map((w) => (
                  <li key={w.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{formatDateLabel(w.date)}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{w.weight} kg</span>
                      <button
                        onClick={() => requestDeleteWeight(w.id, `${w.weight} kg entry`)}
                        className="text-slate-500 active:text-red-400"
                        aria-label={`Delete entry for ${formatDateLabel(w.date)}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle>Habit streaks</SectionTitle>
        {habits.length === 0 ? (
          <EmptyState text="No habits added yet." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {habits.map((h) => {
              const streak = habitStreak(habitLogs, h.id, today)
              return (
                <li key={h.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-300">{h.name}</span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <Flame size={13} /> {streak} day{streak === 1 ? '' : 's'}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card>
        <SectionTitle>Supplements</SectionTitle>
        {supplements.length === 0 ? (
          <EmptyState text="Add supplements in Plan to track them here." />
        ) : (
          <SupplementChart supplements={supplements} logs={supplementLogs} />
        )}
      </Card>

      <Card>
        <SectionTitle>Milestones</SectionTitle>
        <MilestoneTimeline />
      </Card>
    </div>
  )
}
