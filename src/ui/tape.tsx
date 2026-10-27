import { useEffect, useState, type CSSProperties } from 'react'

export const BOOT_MS = 2400
const STRIPES = 22
const WAVE = 40

/** Deterministic bar heights so the waveform looks like audio rather than noise. */
const waveHeights = (n: number, seed = 0.7) => Array.from({ length: n }, (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * seed) * Math.cos(i * 0.23 + 1)))

/** Pill bars that bounce like a level meter. */
export function Waveform({ bars = 28, className = '', tone = 'bg-fg' }: { bars?: number; className?: string; tone?: string }) {
  return (
    <span aria-hidden className={`flex items-center gap-[0.18em] ${className}`}>
      {waveHeights(bars).map((h, i) => (
        <span key={i} style={{ height: `${h * 100}%`, animationDelay: `${-(i * 97) % 1100}ms` } as CSSProperties} className={`animate-eq block w-[0.22em] shrink-0 rounded-full ${tone}`} />
      ))}
    </span>
  )
}

/**
 * Route change: dark stripes wipe the screen while a red playhead runs across and a
 * waveform swells behind it. Keyed by path in the Shell so every navigation replays it.
 */
export function TapeTransition({ delay = 0 }: { delay?: number }) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  return (
    <div aria-hidden className="tape-fx pointer-events-none fixed inset-0 z-[45] flex">
      {Array.from({ length: STRIPES }, (_, i) => (
        <span key={i} className="flex flex-1 justify-center">
          <span style={{ animationDelay: `${delay + i * 14}ms` }} className="animate-stripe block h-full w-[62%] bg-fg" />
        </span>
      ))}
      <div className="absolute inset-x-0 top-1/2 flex h-1/2 -translate-y-1/2 items-center justify-around px-[2vw]">
        {waveHeights(WAVE, 1.1).map((h, i) => (
          <span key={i} style={{ height: `${h * 100}%`, animation: `wave-grow 0.9s cubic-bezier(0.6,0,0.3,1) ${delay + i * 10}ms both` }} className="block w-[0.6vw] rounded-full bg-signal/90" />
        ))}
      </div>
      <span style={{ animationDelay: `${delay}ms` }} className="animate-playhead absolute inset-y-0 left-0 w-[2px] bg-signal">
        <span className="absolute -left-[5px] top-0 size-0 border-x-[6px] border-t-[9px] border-x-transparent border-t-signal" />
        <span className="absolute -left-[5px] bottom-0 size-0 border-x-[6px] border-b-[9px] border-x-transparent border-b-signal" />
      </span>
    </div>
  )
}

function Cassette() {
  const line = { fill: 'none', stroke: 'var(--color-fg)', strokeWidth: 1.4, pathLength: 1, style: { strokeDasharray: 1, strokeDashoffset: 1, animation: `draw-in 1.5s cubic-bezier(0.6,0,0.3,1) forwards` } }
  return (
    <svg viewBox="0 0 320 200" className="w-[min(70vw,30rem)]" aria-hidden>
      <defs>
        <pattern id="boot-dots" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="var(--color-fg)" />
        </pattern>
      </defs>
      <rect x="6" y="6" width="308" height="188" rx="14" fill="url(#boot-dots)" opacity="0.18" style={{ animation: 'fade-in 0.8s ease-out 1.3s both' }} />
      <rect x="6" y="6" width="308" height="188" rx="14" {...line} />
      <rect x="28" y="24" width="264" height="104" rx="8" {...line} />
      <rect x="70" y="58" width="180" height="40" rx="20" {...line} />
      {[110, 210].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="78" r="15" {...line} />
          <circle cx={cx} cy="78" r="5" {...line} />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={cx + 6 * Math.cos((a * Math.PI) / 180)} y1={78 + 6 * Math.sin((a * Math.PI) / 180)} x2={cx + 14 * Math.cos((a * Math.PI) / 180)} y2={78 + 14 * Math.sin((a * Math.PI) / 180)} {...line} />
          ))}
        </g>
      ))}
      <path d="M70 194 L88 150 H232 L250 194" {...line} />
      {[40, 52].map((y) => (
        <line key={y} x1="44" x2="150" y1={y} y2={y} {...line} />
      ))}
      <circle cx="104" cy="172" r="4" {...line} />
      <circle cx="216" cy="172" r="4" {...line} />
    </svg>
  )
}

function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const [n, setN] = useState(from)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(from + (to - from) * p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [from, to, duration])
  return <>{String(n).padStart(3, '0')}%</>
}

function Marker({ side }: { side: 'left' | 'right' }) {
  return (
    <span className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-0' : 'right-0'}`}>
      <span className={`block size-0 border-y-[14px] border-y-transparent ${side === 'left' ? 'border-l-[16px] border-l-fg' : 'border-r-[16px] border-r-fg'}`} />
    </span>
  )
}

/** First visit per tab: an old-school tape deck boot screen. Click or Escape skips it. */
export function Preloader() {
  const [show, setShow] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
      return !sessionStorage.getItem('rvc.booted')
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!show) return
    try {
      sessionStorage.setItem('rvc.booted', '1')
    } catch {
      /* private mode: boot screen plays once per load */
    }
    const t = setTimeout(() => setShow(false), BOOT_MS + 400)
    const skip = (e: KeyboardEvent) => e.key === 'Escape' && setShow(false)
    document.addEventListener('keydown', skip)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', skip)
    }
  }, [show])

  if (!show) return null
  return (
    <div role="status" aria-label="Loading Raw Vision Collective" onClick={() => setShow(false)} style={{ animation: `boot-out 0.3s ease-in ${BOOT_MS}ms forwards` }} className="boot fixed inset-0 z-[80] cursor-pointer bg-void text-fg">
      <div className="absolute inset-3 border border-fg/70 md:inset-5">
        <div className="flex items-start justify-between p-3 text-[9px] uppercase leading-relaxed tracking-[0.2em] md:p-4 md:text-[10px]">
          <p>
            Raw vision player
            <br />
            <span className="text-muted">Sys 2026 · Side A</span>
          </p>
          <img src="/rvc-logo.png" alt="" className="h-7 w-auto invert md:h-9" />
          <p className="text-right">
            <span className="mr-1 inline-block size-1.5 animate-blink rounded-full bg-signal" /> Rec standby
            <br />
            <span className="text-muted">Tape 08 · Night shift</span>
          </p>
        </div>
        <Marker side="left" />
        <Marker side="right" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cassette />
        </div>
        <p className="absolute left-8 top-1/2 -translate-y-1/2 text-xs tabular tracking-[0.2em] md:left-12">
          <Counter from={0} to={100} duration={BOOT_MS - 300} />
        </p>
        <p className="absolute right-8 top-1/2 -translate-y-1/2 text-xs tabular tracking-[0.2em] md:right-12">
          <Counter from={100} to={0} duration={BOOT_MS - 300} />
        </p>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 text-[9px] uppercase tracking-[0.2em] text-muted md:p-4 md:text-[10px]">
          <p>
            ID RVC-2026-1121 · 120 BPM
            <br />
            Identification number 0827-NS-08
          </p>
          <p>Click to skip</p>
        </div>
      </div>
    </div>
  )
}
