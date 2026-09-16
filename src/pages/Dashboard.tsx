import { useMemo } from 'react'
import { Flame, Heart, Moon, Pill, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Card, EmptyState, SectionTitle, StatTile } from '../components/ui'
import { addDaysISO, daysAgoISO, formatShort, isWithinDays, todayISO } from '../lib/date'
import type { Tab } from '../App'

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function Dashboard({ onNavigate: _onNavigate }: { onNavigate: (t: Tab) => void }) {
  const checkIns = useStore((s) => s.checkIns)
  const weights = useStore((s) => s.weights)
  const allMedications = useStore((s) => s.medications)
  const medLogs = useStore((s) => s.medLogs)
  const allHabits = useStore((s) => s.habits)
  const habitLogs = useStore((s) => s.habitLogs)

  const medications = useMemo(() => allMedications.filter((m) => !m.archived), [allMedications])
  const habits = useMemo(() => allHabits.filter((h) => !h.archived), [allHabits])

  const today = todayISO()

  const last7Pain = useMemo(
    () =>
      average(
        checkIns.filter((c) => isWithinDays(c.date, 7) && c.pain !== undefined).map((c) => c.pain!),
      ),
    [checkIns],
  )
  const prev7Pain = useMemo(() => {
    const start = daysAgoISO(13)
    const end = daysAgoISO(7)
    return average(
      checkIns.filter((c) => c.date >= start && c.date < end && c.pain !== undefined).map((c) => c.pain!),
    )
  }, [checkIns])

  const avgSleep7 = useMemo(
    () =>
      average(
        checkIns.filter((c) => isWithinDays(c.date, 7) && c.sleepHours !== undefined).map((c) => c.sleepHours!),
      ),
    [checkIns],
  )
  const avgEnergy7 = useMemo(
    () =>
      average(
        checkIns.filter((c) => isWithinDays(c.date, 7) && c.energy !== undefined).map((c) => c.energy!),
      ),
    [checkIns],
  )

  const latestWeight = useMemo(
    () => [...weights].sort((a, b) => b.date.localeCompare(a.date))[0],
    [weights],
  )

  const medAdherence7 = useMemo(() => {
    if (medications.length === 0) return null
    let possible = 0
    let taken = 0
    for (let i = 0; i < 7; i++) {
      const date = daysAgoISO(i)
      for (const med of medications) {
        possible += med.timesPerDay
        taken += medLogs.filter((l) => l.medicationId === med.id && l.date === date).length
      }
    }
    return possible > 0 ? Math.round((taken / possible) * 100) : null
  }, [medications, medLogs])

  const painChartData = useMemo(() => {
    const days: { date: string; pain: number | null }[] = []
    for (let i = 13; i >= 0; i--) {
      const date = daysAgoISO(i)
      const c = checkIns.find((c) => c.date === date)
      days.push({ date: formatShort(date), pain: c?.pain ?? null })
    }
    return days
  }, [checkIns])

  const weightChartData = useMemo(
    () =>
      [...weights]
        .filter((w) => isWithinDays(w.date, 30))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((w) => ({ date: formatShort(w.date), weight: w.weight })),
    [weights],
  )

  function habitStreak(habitId: string): number {
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

  const painDelta = last7Pain !== null && prev7Pain !== null ? last7Pain - prev7Pain : null

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card className="flex items-center gap-3 border bg-teal-500/10 border-teal-500/30">
        {painDelta === null ? (
          <Minus className="text-slate-400 shrink-0" size={26} />
        ) : painDelta < -0.3 ? (
          <TrendingDown className="text-teal-400 shrink-0" size={26} />
        ) : painDelta > 0.3 ? (
          <TrendingUp className="text-amber-400 shrink-0" size={26} />
        ) : (
          <Minus className="text-slate-300 shrink-0" size={26} />
        )}
        <div>
          <p className="font-semibold text-white">
            {painDelta === null
              ? 'Keep logging to see trends'
              : painDelta < -0.3
                ? 'Pain trending down this week'
                : painDelta > 0.3
                  ? 'Pain trending up this week'
                  : 'Pain holding steady this week'}
          </p>
          <p className="text-xs text-slate-400">
            {painDelta === null
              ? 'Log a check-in on most days to unlock weekly trends.'
              : `Avg pain ${last7Pain!.toFixed(1)}/10 this week vs ${prev7Pain!.toFixed(1)}/10 last week.`}
          </p>
        </div>
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
          sub={avgEnergy7 !== null ? `Energy ${avgEnergy7.toFixed(1)}/10` : 'No data yet'}
          icon={<Moon size={16} />}
        />
        <StatTile
          label="Med adherence"
          value={medAdherence7 !== null ? `${medAdherence7}%` : '—'}
          sub="last 7 days"
          icon={<Pill size={16} />}
        />
      </div>

      <Card>
        <SectionTitle>Pain level (14d)</SectionTitle>
        {painChartData.some((d) => d.pain !== null) ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={painChartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
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
        <SectionTitle>Weight trend (30d)</SectionTitle>
        {weightChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightChartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Log weight daily to see your trend." />
        )}
      </Card>

      <Card>
        <SectionTitle>Habit streaks</SectionTitle>
        {habits.length === 0 ? (
          <EmptyState text="No habits added yet." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {habits.map((h) => {
              const streak = habitStreak(h.id)
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
    </div>
  )
}
