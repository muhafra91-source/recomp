import { useState } from 'react'
import { useStore } from '../store'
import { Button, Card, Input, SectionTitle } from '../components/ui'

export function SettingsPage() {
  const targets = useStore((s) => s.targets)
  const setTargets = useStore((s) => s.setTargets)

  const [form, setForm] = useState({
    calories: String(targets.calories),
    protein: String(targets.protein),
    carbs: String(targets.carbs),
    fat: String(targets.fat),
  })
  const [saved, setSaved] = useState(false)

  function save() {
    setTargets({
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function exportData() {
    const data = localStorage.getItem('recomp-store') ?? '{}'
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recomp-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <Card>
        <SectionTitle>Daily targets</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">
          Set targets that support steady muscle & weight gain (typically a calorie surplus with 0.7–1g
          protein per lb bodyweight).
        </p>
        <div className="flex flex-col gap-3">
          <Input
            label="Calories"
            type="number"
            inputMode="numeric"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Protein (g)"
              type="number"
              inputMode="numeric"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
            />
            <Input
              label="Carbs (g)"
              type="number"
              inputMode="numeric"
              value={form.carbs}
              onChange={(e) => setForm({ ...form, carbs: e.target.value })}
            />
            <Input
              label="Fat (g)"
              type="number"
              inputMode="numeric"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: e.target.value })}
            />
          </div>
          <Button onClick={save}>{saved ? 'Saved ✓' : 'Save targets'}</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">
          All data is stored locally on this device. Export a backup periodically to avoid losing history.
        </p>
        <Button variant="secondary" onClick={exportData}>
          Export backup (.json)
        </Button>
      </Card>
    </div>
  )
}
