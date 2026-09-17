import { useMemo, useState } from 'react'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Button, Card, EmptyState, Input, SectionTitle, Textarea } from '../components/ui'
import { AppointmentCalendar } from '../components/AppointmentCalendar'
import { formatDateLabel, todayISO } from '../lib/date'

const emptyForm = { date: todayISO(), time: '', title: '', provider: '', location: '', notes: '' }

export function PlanAppointments() {
  const appointments = useStore((s) => s.appointments)
  const addAppointment = useStore((s) => s.addAppointment)
  const deleteAppointment = useStore((s) => s.deleteAppointment)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const today = todayISO()

  const { upcoming, past } = useMemo(() => {
    const filtered = selectedDay ? appointments.filter((a) => a.date === selectedDay) : appointments
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
    return {
      upcoming: sorted.filter((a) => a.date >= today),
      past: sorted.filter((a) => a.date < today).reverse(),
    }
  }, [appointments, today, selectedDay])

  function submit() {
    if (!form.title.trim() || !form.date) return
    addAppointment({
      date: form.date,
      time: form.time || undefined,
      title: form.title.trim(),
      provider: form.provider.trim() || undefined,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {showForm ? (
        <Card>
          <SectionTitle>Add appointment</SectionTitle>
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
          <Plus size={18} /> Add appointment
        </Button>
      )}

      <Card>
        <SectionTitle>Calendar</SectionTitle>
        <AppointmentCalendar appointments={appointments} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
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
                <button
                  onClick={() => deleteAppointment(a.id)}
                  className="text-slate-500 active:text-red-400 shrink-0"
                  aria-label={`Delete appointment ${a.title}`}
                >
                  <Trash2 size={14} />
                </button>
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
                <button
                  onClick={() => deleteAppointment(a.id)}
                  className="text-slate-500 active:text-red-400 shrink-0"
                  aria-label={`Delete appointment ${a.title}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
