import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { TodayPage } from './pages/Today'
import { AppointmentsPage } from './pages/Appointments'
import { PlanPage } from './pages/Plan'
import { SettingsPage } from './pages/Settings'

export type Tab = 'dashboard' | 'today' | 'appointments' | 'plan' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('today')

  function handleTabChange(next: Tab) {
    setTab(next)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen pb-24">
      <div key={tab} className="mx-auto max-w-md px-4 pt-6 animate-fade-in-up">
        {tab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
        {tab === 'today' && <TodayPage />}
        {tab === 'appointments' && <AppointmentsPage />}
        {tab === 'plan' && <PlanPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  )
}

export default App
