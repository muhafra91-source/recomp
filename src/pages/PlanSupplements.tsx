import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle } from '../components/ui'
import { UndoBar } from '../components/UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { daysAgoISO, formatShort } from '../lib/date'

export function PlanSupplements() {
  const supplements = useStore((s) => s.supplements)
  const supplementLogs = useStore((s) => s.supplementLogs)
  const addSupplement = useStore((s) => s.addSupplement)
  const updateSupplement = useStore((s) => s.updateSupplement)
  const deleteSupplement = useStore((s) => s.deleteSupplement)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')

  const { pending, requestDelete, undo, isPending } = useUndoableDelete(deleteSupplement)

  function startAdd() {
    setEditingId(null)
    setName('')
    setDose('')
    setShowForm(true)
  }

  function startEdit(id: string, currentName: string, currentDose?: string) {
    setEditingId(id)
    setName(currentName)
    setDose(currentDose ?? '')
    setShowForm(true)
  }

  function submit() {
    if (!name.trim()) return
    const d = dose.trim() || undefined
    if (editingId) {
      updateSupplement(editingId, name.trim(), d)
    } else {
      addSupplement(name.trim(), d)
    }
    setName('')
    setDose('')
    setEditingId(null)
    setShowForm(false)
  }

  const last14 = Array.from({ length: 14 }, (_, i) => daysAgoISO(13 - i))
  const visible = supplements.filter((s) => !s.archived && !isPending(s.id))

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
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              label="Dose (optional)"
              placeholder="e.g. 2000 IU"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
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
        <SectionTitle>Supplements (last 14 days)</SectionTitle>
        {visible.length === 0 ? (
          <EmptyState text="No supplements added yet." />
        ) : (
          <ul className="flex flex-col gap-4">
            {visible.map((s) => {
              const takenDates = new Set(supplementLogs.filter((l) => l.supplementId === s.id).map((l) => l.date))
              const count = last14.filter((d) => takenDates.has(d)).length
              return (
                <li key={s.id}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.name}</p>
                      {s.dose && <p className="text-xs text-slate-500">{s.dose}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-teal-400">{count}/14</span>
                      <button
                        onClick={() => startEdit(s.id, s.name, s.dose)}
                        className="text-slate-500 active:text-teal-400"
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => requestDelete(s.id, s.name)}
                        className="text-slate-500 active:text-red-400"
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {last14.map((date) => (
                      <div
                        key={date}
                        title={`${formatShort(date)}: ${takenDates.has(date) ? 'taken' : 'not taken'}`}
                        className={`flex-1 h-4 rounded-md transition-transform duration-150 hover:scale-110 ${takenDates.has(date) ? 'bg-teal-500' : 'bg-slate-800'}`}
                      />
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
