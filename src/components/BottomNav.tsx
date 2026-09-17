import { CalendarCheck, CalendarClock, LayoutDashboard, ListChecks, Settings } from 'lucide-react'
import type { Tab } from '../App'

const items: { id: Tab; label: string; icon: typeof CalendarClock }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'appointments', label: 'Appts', icon: CalendarClock },
  { id: 'plan', label: 'Plan', icon: ListChecks },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-200 active:scale-90 ${
                isActive ? 'text-teal-400' : 'text-slate-500'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} className="transition-transform duration-200" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
