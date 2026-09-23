import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { UndoBar } from '../components/UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { daysAgoISO, formatShort } from '../lib/date'

const emptyForm = { name: '', dosage: '', timesPerDay: '1', notes: '' }

export function PlanSupplements() {
  const supplements = useStore((s) => s.supplements)
  const supplementLogs = useStore((s) => s.supplementLogs)
  const addSupplement = useStore((s) => s.addSupplement)
  const updateSupplement = useStore((s) => s.updateSupplement)
  const deleteSupplement = useStore((s) => s.deleteSupplement)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { pending, requestDelete, undo, isPending } = useUndoableDelete(deleteSupplement)

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(sup: (typeof supplements)[number]) {
    setEditingId(sup.id)
    setForm({
      name: sup.name,
      dosage: sup.dosage,
      timesPerDay: String(sup.timesPerDay),
      notes: sup.notes ?? '',
    })
    setShowForm(true)
  }

  function submit() {
    const timesPerDay = parseInt(form.timesPerDay, 10)
    if (!form.name.trim() || !Number.isFinite(timesPerDay) || timesPerDay <= 0) return
    const data = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      timesPerDay,
      notes: form.notes.trim() || undefined,
    }
    if (editingId) {
      updateSupplement(editingId, data)
    } else {
      addSupplement(data)
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const last14 = Array.from({ length: 14 }, (_, i) => daysAgoISO(13 - i))
  const visibleSupplements = supplements.filter((s) => !isPending(s.id))

  return (
    <div className="flex flex-col gap-4">
      {pending && <UndoBar label={`Deleted ${pending.label}`} onUndo={undo} />}

      {showForm ? (
        <Card>
          <SectionTitle>{editingId ? 'Edit supplement' : 'Add supplement'}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <Input
              label="Name"
              placeholder="e.g. Vitamin D"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Dosage"
                placeholder="e.g. 2000 IU"
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
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={submit} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button onClick={startAdd} className="flex items-center justify-center gap-2 w-full">
          <Plus size={18} /> Add supplement
        </Button>
      )}

      <Card>
        <SectionTitle>Supplements & consistency</SectionTitle>
        {visibleSupplements.length === 0 ? (
          <EmptyState text="No supplements added yet." />
        ) : (
          <ul className="flex flex-col gap-4">
            {visibleSupplements.map((sup) => (
              <li key={sup.id}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sup.name}</p>
                    <p className="text-xs text-slate-500">
                      {sup.dosage} · {sup.timesPerDay}x/day{sup.notes ? ` · ${sup.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => startEdit(sup)}
                      className="text-slate-500 active:text-teal-400"
                      aria-label={`Edit ${sup.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => requestDelete(sup.id, sup.name)}
                      className="text-slate-500 active:text-red-400"
                      aria-label={`Delete ${sup.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {last14.map((date) => {
                    const count = supplementLogs.filter(
                      (l) => l.supplementId === sup.id && l.date === date,
                    ).length
                    const ratio = count / sup.timesPerDay
                    const color =
                      ratio >= 1 ? 'bg-emerald-500' : ratio > 0 ? 'bg-amber-500' : 'bg-slate-800'
                    return (
                      <div
                        key={date}
                        title={`${formatShort(date)}: ${count}/${sup.timesPerDay}`}
                        className={`flex-1 h-4 rounded-md transition-transform duration-150 hover:scale-110 ${color}`}
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
