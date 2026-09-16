import { Card, SectionTitle, Button } from '../components/ui'

export function SettingsPage() {
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

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      <Card>
        <SectionTitle>Data</SectionTitle>
        <p className="text-xs text-slate-500 mb-3">
          Everything you log — check-ins, weight, medications, PT exercises, and habits — is stored
          locally on this device. Export a backup periodically so you never lose your history.
        </p>
        <Button variant="secondary" onClick={exportData}>
          Export backup (.json)
        </Button>
      </Card>
    </div>
  )
}
