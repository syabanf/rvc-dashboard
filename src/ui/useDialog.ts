import { useEffect, useRef } from 'react'

/** Focus moves in on open, Escape closes, body scroll locks, focus returns to the opener. */
export function useDialog(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('button, a, input')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      opener?.focus()
    }
  }, [open])
  return ref
}
