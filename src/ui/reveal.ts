import { useEffect, type CSSProperties } from 'react'

/** Stagger delay for the nth sibling in a reveal group, wrapping every four. */
export const stagger = (i: number, step = 70) => ({ '--d': `${(i % 4) * step}ms` }) as CSSProperties

/** Watches every [data-reveal] in the document, including nodes added later, and adds .is-in on entry. */
export function useRevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
