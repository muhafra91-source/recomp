import { useState } from 'react'
import { Card, SectionTitle, Button, Input } from '../components/ui'
import { useStore } from '../store'
import { daysBetween, todayISO } from '../lib/date'

export function SettingsPage() {
  const surgeryDate = useStore((s) => s.surgeryDate)
  const setSurgeryDate = useStore((s) => s.setSurgeryDate)
  const [dateInput, setDateInput] = useState(surgeryDate ?? '')

  function exportData() {
    const data = localStorage.getItem('recovery-store') ?? '{}'
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recovery-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function saveSurgeryDate() {
    setSurgeryDate(dateInput || null)
  }

  const day = surgeryDate ? daysBetween(surgeryDate, todayISO()) : null

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <Card>
        <SectionTitle>Recovery timeline</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">
          Set your surgery date to see a "Day X" counter on Today and Overview.
        </p>
        <div className="flex gap-2 items-end">
          <Input
            label="Surgery date"
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <Button onClick={saveSurgeryDate} className="shrink-0">
            Save
          </Button>
        </div>
        {day !== null && (
          <p className="text-xs text-slate-500 mt-2">
            {day >= 0 ? `Today is Day ${day}.` : `Surgery in ${-day} day${-day === 1 ? '' : 's'}.`}
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">
          Everything you log — check-ins, weight, medications, supplements, PT exercises, and habits — is stored
          locally on this device. Export a backup periodically so you never lose your history.
        </p>
        <Button variant="secondary" onClick={exportData}>
          Export backup (.json)
        </Button>
      </Card>
    </div>
  )
}
