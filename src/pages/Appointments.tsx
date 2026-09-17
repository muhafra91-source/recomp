import { useMemo, useState } from 'react'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle, Textarea } from '../components/ui'
import { AppointmentCalendar } from '../components/AppointmentCalendar'
import { UndoBar } from '../components/UndoBar'
import { useUndoableDelete } from '../lib/useUndoableDelete'
import { formatDateLabel, todayISO } from '../lib/date'
import type { Appointment } from '../types'

const emptyForm = { date: todayISO(), time: '', title: '', provider: '', location: '', notes: '' }

export function AppointmentsPage() {
  const appointments = useStore((s) => s.appointments)
  const addAppointment = useStore((s) => s.addAppointment)
  const updateAppointment = useStore((s) => s.updateAppointment)
  const deleteAppointment = useStore((s) => s.deleteAppointment)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { pending, requestDelete, undo, isPending } = useUndoableDelete(deleteAppointment)

  const today = todayISO()
  const visibleAppointments = appointments.filter((a) => !isPending(a.id))

  const { upcoming, past } = useMemo(() => {
    const filtered = selectedDay
      ? visibleAppointments.filter((a) => a.date === selectedDay)
      : visibleAppointments
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    return {
      upcoming: sorted.filter((a) => a.date >= today),
      past: sorted.filter((a) => a.date < today).reverse(),
    }
  }, [visibleAppointments, today, selectedDay])

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(a: Appointment) {
    setEditingId(a.id)
    setForm({
      date: a.date,
      time: a.time ?? '',
      title: a.title,
      provider: a.provider ?? '',
      location: a.location ?? '',
      notes: a.notes ?? '',
    })
    setShowForm(true)
  }

  function submit() {
    if (!form.title.trim() || !form.date) return
    const data = {
      date: form.date,
      time: form.time || undefined,
      title: form.title.trim(),
      provider: form.provider.trim() || undefined,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
    if (editingId) {
      updateAppointment(editingId, data)
    } else {
      addAppointment(data)
    }
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {pending && <UndoBar label={`Deleted ${pending.label}`} onUndo={undo} />}

      <h1 className="text-xl font-bold text-white">Appointments</h1>

      {showForm ? (
        <Card>
          <SectionTitle>{editingId ? 'Edit appointment' : 'Add appointment'}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                label="Time (optional)"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <Input
              label="What's it for"
              placeholder="e.g. Follow-up with Dr. Patel"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Provider (optional)"
                placeholder="e.g. Dr. Patel"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              />
              <Input
                label="Location (optional)"
                placeholder="e.g. Main St Clinic"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <Textarea
              label="Notes (optional)"
              rows={2}
              placeholder="Anything to remember or bring"
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
          <Plus size={18} /> Add appointment
        </Button>
      )}

      <Card>
        <SectionTitle>Calendar</SectionTitle>
        <AppointmentCalendar appointments={visibleAppointments} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      </Card>

      <Card>
        <SectionTitle>Upcoming</SectionTitle>
        {upcoming.length === 0 ? (
          <EmptyState text={selectedDay ? 'No upcoming appointments on this day.' : 'No upcoming appointments.'} />
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-slate-900/60 px-3 py-2.5"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarClock size={14} className="text-teal-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatDateLabel(a.date)}
                      {a.time ? ` · ${a.time}` : ''}
                      {a.provider ? ` · ${a.provider}` : ''}
                    </p>
                    {a.location && <p className="text-xs text-slate-500">{a.location}</p>}
                    {a.notes && <p className="text-xs text-slate-400 mt-1">{a.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    className="text-slate-500 active:text-teal-400"
                    aria-label={`Edit appointment ${a.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => requestDelete(a.id, a.title)}
                    className="text-slate-500 active:text-red-400"
                    aria-label={`Delete appointment ${a.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {past.length > 0 && (
        <Card>
          <SectionTitle>Past</SectionTitle>
          <ul className="flex flex-col divide-y divide-slate-700/50">
            {past.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300 truncate">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateLabel(a.date)}
                    {a.provider ? ` · ${a.provider}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    className="text-slate-500 active:text-teal-400"
                    aria-label={`Edit appointment ${a.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => requestDelete(a.id, a.title)}
                    className="text-slate-500 active:text-red-400"
                    aria-label={`Delete appointment ${a.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
