import { useEffect, useRef, useState } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+'
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Mono label that scrambles through glyphs when its parent link is hovered or focused. */
export function Scramble({ text }: { text: string }) {
  const [shown, setShown] = useState(text)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = ref.current?.parentElement
    if (!host) return
    let frame = 0
    let raf = 0
    const run = () => {
      if (reduced()) return
      cancelAnimationFrame(raf)
      frame = 0
      const tick = () => {
        frame++
        const settled = Math.floor(frame / 2)
        setShown(
          [...text]
            .map((c, i) => (c === ' ' || i < settled ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(''),
        )
        if (settled < text.length) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    host.addEventListener('mouseenter', run)
    host.addEventListener('focus', run)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('mouseenter', run)
      host.removeEventListener('focus', run)
    }
  }, [text])

  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {shown}
      </span>
    </>
  )
}

/** Counts from 0 to the target once the element scrolls into view. */
export function CountUp({ value, format = (n) => String(n), duration = 1400 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(() => (reduced() ? value : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration)
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular">
      {format(n)}
    </span>
  )
}
