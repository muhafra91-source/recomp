import { useEffect } from 'react'
import { Trophy } from 'lucide-react'

export function StreakToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="animate-toast-in flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 shadow-lg shadow-teal-900/40 text-slate-900 font-semibold text-sm">
        <Trophy size={16} />
        {message}
      </div>
    </div>
  )
}
