import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, ProgressBar, SectionTitle } from '../components/ui'
import { addDaysISO, formatDateLabel, nowHM, todayISO } from '../lib/date'

const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '' }

export function FoodPage() {
  const foods = useStore((s) => s.foods)
  const addFood = useStore((s) => s.addFood)
  const deleteFood = useStore((s) => s.deleteFood)
  const targets = useStore((s) => s.targets)

  const [date, setDate] = useState(todayISO())
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const dayFoods = useMemo(
    () => foods.filter((f) => f.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [foods, date],
  )

  const totals = useMemo(
    () =>
      dayFoods.reduce(
        (acc, f) => ({
          calories: acc.calories + f.calories,
          protein: acc.protein + f.protein,
          carbs: acc.carbs + f.carbs,
          fat: acc.fat + f.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [dayFoods],
  )

  function submit() {
    const calories = parseFloat(form.calories) || 0
    if (!form.name.trim() || calories <= 0) return
    addFood({
      date,
      time: nowHM(),
      name: form.name.trim(),
      calories,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Food</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate((d) => addDaysISO(d, -1))}
            className="p-1.5 text-slate-400 active:text-white"
            aria-label="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-slate-300 w-24 text-center">{formatDateLabel(date)}</span>
          <button
            onClick={() => setDate((d) => addDaysISO(d, 1))}
            disabled={date >= todayISO()}
            className="p-1.5 text-slate-400 active:text-white disabled:opacity-30"
            aria-label="Next day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <Card>
        <SectionTitle>Today's totals</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Calories</span>
              <span className="font-semibold text-white">
                {totals.calories} <span className="text-slate-500 font-normal">/ {targets.calories}</span>
              </span>
            </div>
            <ProgressBar value={totals.calories} target={targets.calories} color="bg-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Macro label="Protein" value={totals.protein} target={targets.protein} color="bg-sky-500" />
            <Macro label="Carbs" value={totals.carbs} target={targets.carbs} color="bg-amber-500" />
            <Macro label="Fat" value={totals.fat} target={targets.fat} color="bg-fuchsia-500" />
          </div>
        </div>
      </Card>

      {showForm ? (
        <Card>
          <SectionTitle>Add food</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <Input
              label="Name"
              placeholder="e.g. Chicken & rice"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <div className="grid grid-cols-4 gap-2">
              <Input
                label="Cal"
                type="number"
                inputMode="numeric"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
              />
              <Input
                label="Protein"
                type="number"
                inputMode="numeric"
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: e.target.value })}
              />
              <Input
                label="Carbs"
                type="number"
                inputMode="numeric"
                value={form.carbs}
                onChange={(e) => setForm({ ...form, carbs: e.target.value })}
              />
              <Input
                label="Fat"
                type="number"
                inputMode="numeric"
                value={form.fat}
                onChange={(e) => setForm({ ...form, fat: e.target.value })}
              />
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
          <Plus size={18} /> Log food
        </Button>
      )}

      <Card>
        <SectionTitle>Entries</SectionTitle>
        {dayFoods.length === 0 ? (
          <EmptyState text="Nothing logged for this day." />
        ) : (
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {dayFoods.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.name}</p>
                  <p className="text-xs text-slate-500">
                    {f.time} · {f.calories} cal · P{f.protein} C{f.carbs} F{f.fat}
                  </p>
                </div>
                <button
                  onClick={() => deleteFood(f.id)}
                  className="text-slate-500 active:text-red-400 shrink-0"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Macro({
  label,
  value,
  target,
  color,
}: {
  label: string
  value: number
  target: number
  color: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">
        {value}g <span className="text-slate-500 font-normal">/{target}g</span>
      </span>
      <ProgressBar value={value} target={target} color={color} />
    </div>
  )
}
