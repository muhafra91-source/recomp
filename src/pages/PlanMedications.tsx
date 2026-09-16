import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { daysAgoISO, formatShort } from '../lib/date'

const emptyForm = { name: '', dosage: '', timesPerDay: '1', notes: '' }

export function PlanMedications() {
  const medications = useStore((s) => s.medications)
  const medLogs = useStore((s) => s.medLogs)
  const addMedication = useStore((s) => s.addMedication)
  const deleteMedication = useStore((s) => s.deleteMedication)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function submit() {
    const timesPerDay = parseInt(form.timesPerDay, 10)
    if (!form.name.trim() || !Number.isFinite(timesPerDay) || timesPerDay <= 0) return
    addMedication({
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      timesPerDay,
      notes: form.notes.trim() || undefined,
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  const last14 = Array.from({ length: 14 }, (_, i) => daysAgoISO(13 - i))

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <Card>
          <SectionTitle>Add medication</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <Input
              label="Name"
              placeholder="e.g. Ibuprofen"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Dosage"
                placeholder="e.g. 200mg"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              />
              <Input
                label="Times per day"
                type="number"
                inputMode="numeric"
                value={form.timesPerDay}
                onChange={(e) => setForm({ ...form, timesPerDay: e.target.value })}
              />
            </div>
            <Input
              label="Notes (optional)"
              placeholder="e.g. take with food"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
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
          <Plus size={18} /> Add medication
        </Button>
      )}

      <Card>
        <SectionTitle>Medications & adherence</SectionTitle>
        {medications.length === 0 ? (
          <EmptyState text="No medications added yet." />
        ) : (
          <ul className="flex flex-col gap-4">
            {medications.map((med) => (
              <li key={med.id}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{med.name}</p>
                    <p className="text-xs text-slate-500">
                      {med.dosage} · {med.timesPerDay}x/day{med.notes ? ` · ${med.notes}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="text-slate-500 active:text-red-400 shrink-0"
                    aria-label={`Delete ${med.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {last14.map((date) => {
                    const count = medLogs.filter((l) => l.medicationId === med.id && l.date === date).length
                    const ratio = count / med.timesPerDay
                    const color =
                      ratio >= 1 ? 'bg-teal-500' : ratio > 0 ? 'bg-amber-500' : 'bg-slate-800'
                    return (
                      <div
                        key={date}
                        title={`${formatShort(date)}: ${count}/${med.timesPerDay}`}
                        className={`flex-1 h-4 rounded ${color}`}
                      />
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
