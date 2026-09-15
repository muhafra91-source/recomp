import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { WeightPage } from './pages/Weight'
import { WorkoutsPage } from './pages/Workouts'
import { FoodPage } from './pages/Food'
import { SettingsPage } from './pages/Settings'

export type Tab = 'dashboard' | 'weight' | 'workouts' | 'food' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-md px-4 pt-6">
        {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
        {tab === 'weight' && <WeightPage />}
        {tab === 'workouts' && <WorkoutsPage />}
        {tab === 'food' && <FoodPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default App
