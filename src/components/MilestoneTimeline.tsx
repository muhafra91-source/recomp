import { useState } from 'react'
import { Flag, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, EmptyState, Input, Textarea } from './ui'
import { UndoBar } from './UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { formatDateLabel, todayISO } from '../lib/date'
import type { Milestone } from '../types'

export function MilestoneTimeline() {
  const milestones = useStore((s) => s.milestones)
  const addMilestone = useStore((s) => s.addMilestone)
  const updateMilestone = useStore((s) => s.updateMilestone)
  const deleteMilestone = useStore((s) => s.deleteMilestone)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [date, setDate] = useState(todayISO())
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  const { pending, requestDelete, undo, isPending } = useUndoableDelete(deleteMilestone)

  const sorted = milestones.filter((m) => !isPending(m.id)).sort((a, b) => b.date.localeCompare(a.date))

  function startAdd() {
    setEditingId(null)
    setDate(todayISO())
    setTitle('')
    setNotes('')
    setShowForm(true)
  }

  function startEdit(m: Milestone) {
    setEditingId(m.id)
    setDate(m.date)
    setTitle(m.title)
    setNotes(m.notes ?? '')
    setShowForm(true)
  }

  function submit() {
    if (!title.trim()) return
    if (editingId) {
      updateMilestone(editingId, date, title.trim(), notes.trim() || undefined)
    } else {
      addMilestone(date, title.trim(), notes.trim() || undefined)
    }
    setDate(todayISO())
    setTitle('')
    setNotes('')
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {pending && <UndoBar label={`Deleted ${pending.label}`} onUndo={undo} />}

      {showForm ? (
        <div className="flex flex-col gap-2.5 rounded-2xl bg-slate-900/60 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input
              label="Milestone"
              placeholder="e.g. Cleared for light exercise"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <Textarea
            label="Notes (optional)"
            rows={2}
            placeholder="Anything to remember about this milestone"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex gap-2">
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
      ) : (
        <Button
          variant="secondary"
          onClick={startAdd}
          className="flex items-center justify-center gap-2 w-full"
        >
          <Plus size={16} /> Log a milestone
        </Button>
      )}

      {sorted.length === 0 ? (
        <EmptyState text="No milestones logged yet." />
      ) : (
        <ul className="flex flex-col">
          {sorted.map((m, i) => (
            <li key={m.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0">
                  <Flag size={13} className="text-teal-400" />
                </span>
                {i < sorted.length - 1 && <span className="w-px flex-1 bg-slate-700/70 my-1" />}
              </div>
              <div className="min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.title}</p>
                    <p className="text-xs text-slate-500">{formatDateLabel(m.date)}</p>
                    {m.notes && <p className="text-xs text-slate-400 mt-1">{m.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => startEdit(m)}
                      className="text-slate-500 active:text-teal-400"
                      aria-label={`Edit milestone ${m.title}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => requestDelete(m.id, m.title)}
                      className="text-slate-500 active:text-red-400"
                      aria-label={`Delete milestone ${m.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
