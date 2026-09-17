export function UndoBar({ label, onUndo }: { label: string; onUndo: () => void }) {
  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-800 border border-slate-700 px-4 py-2.5 shadow-lg animate-toast-in">
        <span className="text-sm text-slate-200">{label}</span>
        <button onClick={onUndo} className="text-sm font-semibold text-teal-400 active:text-teal-300 transition-colors">
          Undo
        </button>
      </div>
    </div>
  )
}
