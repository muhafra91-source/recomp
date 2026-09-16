import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, ProgressBar, SectionTitle, Select } from '../components/ui'
import { addDaysISO, formatDateLabel, nowHM, todayISO } from '../lib/date'
import { BUILTIN_FOODS, GENERIC_UNITS, computeMacros, unitsForFood } from '../data/foods'
import type { FoodDatabaseItem } from '../data/foods'

const emptyNewFood = { calories: '', protein: '', carbs: '', fat: '' }

export function FoodPage() {
  const foods = useStore((s) => s.foods)
  const addFood = useStore((s) => s.addFood)
  const deleteFood = useStore((s) => s.deleteFood)
  const customFoods = useStore((s) => s.customFoods)
  const addCustomFood = useStore((s) => s.addCustomFood)
  const targets = useStore((s) => s.targets)

  const [date, setDate] = useState(todayISO())
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [unit, setUnit] = useState('g')
  const [quantity, setQuantity] = useState('')
  const [creating, setCreating] = useState(false)
  const [newFood, setNewFood] = useState(emptyNewFood)

  const allFoods = useMemo(() => [...BUILTIN_FOODS, ...customFoods], [customFoods])

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase()
    if (!q || selectedFoodId) return []
    return allFoods.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
  }, [allFoods, name, selectedFoodId])

  const matchedFood = useMemo(() => {
    if (selectedFoodId) return allFoods.find((f) => f.id === selectedFoodId)
    return allFoods.find((f) => f.name.toLowerCase() === name.trim().toLowerCase())
  }, [allFoods, selectedFoodId, name])

  const unitOptions = matchedFood ? unitsForFood(matchedFood) : GENERIC_UNITS
  const qtyNum = parseFloat(quantity)

  const preview =
    matchedFood && Number.isFinite(qtyNum) && qtyNum > 0 ? computeMacros(matchedFood, unit, qtyNum) : null
  const newFoodPreview =
    creating && Number.isFinite(qtyNum) && qtyNum > 0 && newFood.calories !== ''
      ? computeMacros(
          {
            per100g: {
              calories: parseFloat(newFood.calories) || 0,
              protein: parseFloat(newFood.protein) || 0,
              carbs: parseFloat(newFood.carbs) || 0,
              fat: parseFloat(newFood.fat) || 0,
            },
            units: [],
          },
          unit,
          qtyNum,
        )
      : null

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

  function resetForm() {
    setName('')
    setSelectedFoodId(null)
    setUnit('g')
    setQuantity('')
    setCreating(false)
    setNewFood(emptyNewFood)
    setShowForm(false)
  }

  function selectSuggestion(food: FoodDatabaseItem) {
    setName(food.name)
    setSelectedFoodId(food.id)
    setUnit('g')
  }

  function submit() {
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) return

    let food: FoodDatabaseItem | undefined = matchedFood
    if (!food) {
      if (!creating || !name.trim() || !newFood.calories) return
      food = addCustomFood({
        name: name.trim(),
        per100g: {
          calories: parseFloat(newFood.calories) || 0,
          protein: parseFloat(newFood.protein) || 0,
          carbs: parseFloat(newFood.carbs) || 0,
          fat: parseFloat(newFood.fat) || 0,
        },
        units: [],
      })
    }

    const macros = computeMacros(food, unit, qtyNum)
    addFood({ date, time: nowHM(), name: food.name, quantity: qtyNum, unit, ...macros })
    resetForm()
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
            <div className="relative">
              <Input
                label="Food"
                placeholder="e.g. chicken"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setSelectedFoodId(null)
                  setUnit('g')
                  setCreating(false)
                }}
                autoComplete="off"
                autoFocus
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
                  {suggestions.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(f)}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-200 active:bg-slate-800"
                      >
                        {f.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Amount"
                type="number"
                inputMode="decimal"
                placeholder="e.g. 150"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                {unitOptions.map((u) => (
                  <option key={u.unit} value={u.unit}>
                    {u.unit}
                  </option>
                ))}
              </Select>
            </div>

            {matchedFood && preview && (
              <p className="text-xs text-emerald-400">
                {preview.calories} cal · P{preview.protein} C{preview.carbs} F{preview.fat}
              </p>
            )}

            {!matchedFood && name.trim() && suggestions.length === 0 && (
              <div>
                {!creating ? (
                  <Button variant="secondary" onClick={() => setCreating(true)} className="w-full">
                    "{name.trim()}" isn't in your list — add it
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 rounded-xl bg-slate-900 p-3">
                    <p className="text-xs text-slate-400">Nutrition per 100g of "{name.trim()}"</p>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        label="Cal"
                        type="number"
                        inputMode="numeric"
                        value={newFood.calories}
                        onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                      />
                      <Input
                        label="Protein"
                        type="number"
                        inputMode="numeric"
                        value={newFood.protein}
                        onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                      />
                      <Input
                        label="Carbs"
                        type="number"
                        inputMode="numeric"
                        value={newFood.carbs}
                        onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                      />
                      <Input
                        label="Fat"
                        type="number"
                        inputMode="numeric"
                        value={newFood.fat}
                        onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                      />
                    </div>
                    {newFoodPreview && (
                      <p className="text-xs text-emerald-400">
                        This amount: {newFoodPreview.calories} cal · P{newFoodPreview.protein} C
                        {newFoodPreview.carbs} F{newFoodPreview.fat}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <Button variant="secondary" onClick={resetForm} className="flex-1">
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
                    {f.time}
                    {f.quantity ? ` · ${f.quantity}${f.unit ?? ''}` : ''} · {f.calories} cal · P{f.protein} C
                    {f.carbs} F{f.fat}
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
