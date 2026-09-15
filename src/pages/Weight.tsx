import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { formatDateLabel, formatShort, isWithinDays, todayISO } from '../lib/date'
import type { DateRange } from '../types'

export function WeightPage() {
  const weights = useStore((s) => s.weights)
  const addWeight = useStore((s) => s.addWeight)
  const deleteWeight = useStore((s) => s.deleteWeight)

  const [value, setValue] = useState('')
  const [range, setRange] = useState<DateRange>('month')
  const today = todayISO()

  const sorted = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights])
  const filtered = useMemo(() => {
    if (range === 'all') return sorted
    const days = range === 'week' ? 7 : 30
    return sorted.filter((w) => isWithinDays(w.date, days))
  }, [sorted, range])

  const todayEntry = weights.find((w) => w.date === today)
  const chartData = filtered.map((w) => ({ date: formatShort(w.date), weight: w.weight }))

  function submit() {
    const n = parseFloat(value)
    if (!Number.isFinite(n) || n <= 0) return
    addWeight(today, n)
    setValue('')
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Weight</h1>

      <Card>
        <SectionTitle>Log today's weight</SectionTitle>
        <div className="flex gap-2 items-end">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder={todayEntry ? String(todayEntry.weight) : 'e.g. 165.4'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button onClick={submit} className="shrink-0">
            {todayEntry ? 'Update' : 'Log'}
          </Button>
        </div>
        {todayEntry && <p className="text-xs text-slate-500 mt-2">Today logged: {todayEntry.weight} lbs</p>}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Trend</SectionTitle>
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            {(['week', 'month', 'all'] as DateRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
                  range === r ? 'bg-emerald-500 text-slate-900' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Log a few days to see your trend." />
        )}
      </Card>

      <Card>
        <SectionTitle>History</SectionTitle>
        {sorted.length === 0 ? (
          <EmptyState text="No entries yet." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {[...sorted].reverse().map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-300">{formatDateLabel(w.date)}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{w.weight} lbs</span>
                  <button
                    onClick={() => deleteWeight(w.id)}
                    className="text-slate-500 active:text-red-400"
                    aria-label={`Delete entry for ${formatDateLabel(w.date)}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
