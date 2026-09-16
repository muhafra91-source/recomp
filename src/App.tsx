import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { TodayPage } from './pages/Today'
import { WeightPage } from './pages/Weight'
import { PlanPage } from './pages/Plan'
import { SettingsPage } from './pages/Settings'

export type Tab = 'dashboard' | 'today' | 'weight' | 'plan' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-md px-4 pt-6">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'today' && <TodayPage />}
        {tab === 'weight' && <WeightPage />}
        {tab === 'plan' && <PlanPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default App
