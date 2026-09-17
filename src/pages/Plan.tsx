import { useState } from 'react'
import { PlanMedications } from './PlanMedications'
import { PlanPT } from './PlanPT'
import { PlanHabits } from './PlanHabits'

type SubTab = 'medications' | 'pt' | 'habits'

const subTabs: { id: SubTab; label: string }[] = [
  { id: 'medications', label: 'Meds' },
  { id: 'pt', label: 'PT' },
  { id: 'habits', label: 'Habits' },
]

export function PlanPage() {
  const [sub, setSub] = useState<SubTab>('medications')

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold text-white">Plan</h1>

      <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
              sub === t.id ? 'bg-teal-500 text-slate-900' : 'text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'medications' && <PlanMedications />}
      {sub === 'pt' && <PlanPT />}
      {sub === 'habits' && <PlanHabits />}
    </div>
  )
}
