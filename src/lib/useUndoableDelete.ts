import { useRef, useState } from 'react'

/** Delays an actual delete for `delayMs`, showing an "Undo" window.
 * The item is hidden immediately via `isPending`; nothing is removed
 * from the store until the window elapses without an undo. */
export function useUndoableDelete(commitDelete: (id: string) => void, delayMs = 4000) {
  const [pending, setPending] = useState<{ id: string; label: string } | null>(null)
  const timeoutRef = useRef<number | null>(null)

  function requestDelete(id: string, label: string) {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      if (pending) commitDelete(pending.id)
    }
    timeoutRef.current = window.setTimeout(() => {
      commitDelete(id)
      setPending(null)
      timeoutRef.current = null
    }, delayMs)
    setPending({ id, label })
  }

  function undo() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPending(null)
  }

  function isPending(id: string) {
    return pending?.id === id
  }

  return { pending, requestDelete, undo, isPending }
}
