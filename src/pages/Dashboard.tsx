import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, Dumbbell, Scale, Utensils } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Button, Card, EmptyState, ProgressBar, SectionTitle, StatTile } from '../components/ui'
import { daysAgoISO, formatShort, isWithinDays, todayISO } from '../lib/date'
import type { Tab } from '../App'

export function Dashboard({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const weights = useStore((s) => s.weights)
  const foods = useStore((s) => s.foods)
  const targets = useStore((s) => s.targets)

  const today = todayISO()

  const todayFoods = useMemo(() => foods.filter((f) => f.date === today), [foods, today])
  const todayTotals = useMemo(
    () =>
      todayFoods.reduce(
        (acc, f) => ({ calories: acc.calories + f.calories, protein: acc.protein + f.protein }),
        { calories: 0, protein: 0 },
      ),
    [todayFoods],
  )

  const latestWeight = useMemo(
    () => [...weights].sort((a, b) => b.date.localeCompare(a.date))[0],
    [weights],
  )
  const prevWeight = useMemo(() => {
    const sorted = [...weights].sort((a, b) => b.date.localeCompare(a.date))
    return sorted[1]
  }, [weights])
  const weightDelta = latestWeight && prevWeight ? latestWeight.weight - prevWeight.weight : null

  const weekWeights = useMemo(
    () =>
      [...weights]
        .filter((w) => isWithinDays(w.date, 30))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((w) => ({ date: formatShort(w.date), weight: w.weight })),
    [weights],
  )

  const calorieConsistency = useMemo(() => {
    const days: { date: string; calories: number; hit: boolean }[] = []
    for (let i = 6; i >= 0; i--) {
      const iso = daysAgoISO(i)
      const cals = foods.filter((f) => f.date === iso).reduce((sum, f) => sum + f.calories, 0)
      days.push({ date: formatShort(iso), calories: cals, hit: cals >= targets.calories * 0.9 })
    }
    return days
  }, [foods, targets])

  const calProgress = targets.calories > 0 ? todayTotals.calories / targets.calories : 0
  const proProgress = targets.protein > 0 ? todayTotals.protein / targets.protein : 0
  const onTrack = calProgress >= 0.9 && calProgress <= 1.15 && proProgress >= 0.9

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <Card
        className={`flex items-center gap-3 border ${
          onTrack ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
        }`}
      >
        {onTrack ? (
          <CheckCircle2 className="text-emerald-400 shrink-0" size={28} />
        ) : (
          <AlertTriangle className="text-amber-400 shrink-0" size={28} />
        )}
        <div>
          <p className={`font-semibold ${onTrack ? 'text-emerald-300' : 'text-amber-300'}`}>
            {onTrack ? "On track today" : 'Not there yet today'}
          </p>
          <p className="text-xs text-slate-400">
            {onTrack
              ? 'Calories and protein are on target.'
              : 'Log more food to hit your calorie and protein targets.'}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Calories"
          value={`${todayTotals.calories}`}
          sub={`of ${targets.calories} target`}
          icon={<Utensils size={16} />}
        />
        <StatTile
          label="Protein"
          value={`${todayTotals.protein}g`}
          sub={`of ${targets.protein}g target`}
          icon={<Utensils size={16} />}
        />
        <StatTile
          label="Latest weight"
          value={latestWeight ? `${latestWeight.weight} lbs` : '—'}
          sub={
            weightDelta !== null
              ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)} lbs vs prev`
              : latestWeight
                ? 'First entry logged'
                : 'No entries yet'
          }
          icon={<Scale size={16} />}
        />
        <StatTile
          label="Calories left"
          value={`${Math.max(0, targets.calories - todayTotals.calories)}`}
          sub="to hit target"
          icon={<Utensils size={16} />}
        />
      </div>

      <Card>
        <SectionTitle>Today's progress</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Calories</span>
              <span>
                {todayTotals.calories} / {targets.calories}
              </span>
            </div>
            <ProgressBar value={todayTotals.calories} target={targets.calories} color="bg-emerald-500" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Protein</span>
              <span>
                {todayTotals.protein}g / {targets.protein}g
              </span>
            </div>
            <ProgressBar value={todayTotals.protein} target={targets.protein} color="bg-sky-500" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => onNavigate('food')} className="flex flex-col items-center gap-1 py-3">
          <Utensils size={18} />
          <span className="text-xs">Log food</span>
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('workouts')} className="flex flex-col items-center gap-1 py-3">
          <Dumbbell size={18} />
          <span className="text-xs">Log workout</span>
        </Button>
        <Button variant="secondary" onClick={() => onNavigate('weight')} className="flex flex-col items-center gap-1 py-3">
          <Scale size={18} />
          <span className="text-xs">Log weight</span>
        </Button>
      </div>

      <Card>
        <SectionTitle>Weight trend (30d)</SectionTitle>
        {weekWeights.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekWeights} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Log weight daily to see your trend." />
        )}
      </Card>

      <Card>
        <SectionTitle>Calorie consistency (7d)</SectionTitle>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={calorieConsistency} margin={{ left: -20, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {calorieConsistency.map((d, i) => (
                <Cell key={i} fill={d.hit ? '#10b981' : '#475569'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
