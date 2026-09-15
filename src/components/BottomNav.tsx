import { Dumbbell, LayoutDashboard, Scale, Settings, Utensils } from 'lucide-react'
import type { Tab } from '../App'

const items: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
