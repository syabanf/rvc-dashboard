import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { countdown } from '../domain/rules'
import type { MerchItem, Scene } from '../domain/types'
import { Media } from './Media'

/** Two marquee bands crossing at an angle: red runs left, ink runs right. */
export function CrossBands({ items, className = '' }: { items: string[]; className?: string }) {
  const band = (tone: string, tilt: string, reverse: boolean) => (
    <div className={`${tone} ${tilt} w-[120%] -translate-x-[8%] overflow-hidden py-3 md:py-4`}>
      <div className={`animate-marquee flex w-max gap-6 whitespace-nowrap font-display text-2xl uppercase leading-none md:text-4xl ${reverse ? '[animation-direction:reverse]' : ''}`}>
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-6">
            {t} <span aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div aria-hidden className={`relative overflow-hidden py-6 ${className}`}>
      {band('bg-fg text-void', 'rotate-[2deg]', true)}
      <div className="-mt-12 md:-mt-16">{band('bg-signal text-fg', '-rotate-[2.5deg]', false)}</div>
    </div>
  )
}

// Arch, rectangle, circle. The caller sizes each one; a circle needs a square box.
export const SHAPES = ['rounded-t-full', '', 'rounded-full'] as const

/** Grayscale photo in a plain shape with a hairline frame set off around it. Colour returns on hover. */
export function Sticker({ image, seed, scene, label, shape = 0, caption, className = '', style }: { image?: string; seed: string; scene: Scene; label?: string; shape?: number; caption?: string; className?: string; style?: CSSProperties }) {
  const round = SHAPES[shape % SHAPES.length]
  return (
    <div className={`sticker relative ${className}`} style={style}>
      <span aria-hidden className={`absolute -inset-2.5 border border-current opacity-25 md:-inset-3.5 ${round}`} />
      <div className={`relative size-full overflow-hidden grayscale transition-[filter] duration-1000 hover:grayscale-0 ${round}`}>
        <Media image={image} seed={seed} scene={scene} label={label} ripple={false} />
      </div>
      {caption && <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.4em] opacity-60">{caption}</span>}
    </div>
  )
}

/** Decorative QR-like code drawn from a seed. It is not scannable. */
export function Qr({ seed, className = '' }: { seed: string; className?: string }) {
  const n = 21
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const finder = (x: number, y: number) => x < 7 && y < 7
  const cells: [number, number][] = []
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      h = (h * 1103515245 + 12345) >>> 0
      if (!finder(x, y) && !finder(n - 1 - x, y) && !finder(x, n - 1 - y) && h % 100 < 46) cells.push([x, y])
    }
  const eye = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width="6" height="6" fill="none" stroke="currentColor" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} aria-hidden className={className} fill="currentColor" shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
      ))}
      {[eye(0, 0), eye(n - 7, 0), eye(0, n - 7)]}
    </svg>
  )
}

/** Days, hours, minutes and seconds to a date, ticking every second. Each digit drops in when it changes. */
export function LiveCountdown({ iso, className = '' }: { iso: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const c = countdown(iso, now)
  const parts: [string, number][] = [
    ['Days', c.days],
    ['Hrs', c.hours],
    ['Min', c.minutes],
    ['Sec', c.seconds],
  ]
  return (
    <div role="timer" aria-label={`${c.days} days, ${c.hours} hours to go`} className={`flex gap-2 ${className}`}>
      {parts.map(([label, v]) => (
        <div key={label} className="min-w-16 border border-current px-2 py-2 text-center">
          <span className="block overflow-hidden font-display text-3xl leading-none tabular md:text-4xl">
            {[...String(v).padStart(2, '0')].map((d, i) => (
              <span key={`${i}-${d}`} className="inline-block animate-rise">
                {d}
              </span>
            ))}
          </span>
          <span className="mt-1 block text-[9px] uppercase tracking-[0.25em] opacity-70">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** Text with red and cyan copies that tear across it every few seconds. */
export function Glitch({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span data-text={text} className={`glitch ${className}`}>
      {text}
    </span>
  )
}

/** Shop thumbnail framed by four corner brackets. */
export function BracketThumb({ children, className = '' }: { children: ReactNode; className?: string }) {
  const corner = 'absolute size-2.5 border-current'
  return (
    <span className={`relative block shrink-0 p-1.5 ${className}`}>
      <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      <span className="block size-full overflow-hidden bg-panel">{children}</span>
    </span>
  )
}

/** Product code from its id, m03 becomes #003. */
export const itemCode = (item: MerchItem) => `#${item.id.replace(/\D/g, '').padStart(3, '0')}`

/** Spec columns in the Catwalk style: small label over an uppercase value. */
export function Specs({ specs, className = '' }: { specs: [string, string][]; className?: string }) {
  return (
    <dl className={`flex gap-6 ${className}`}>
      {specs.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[9px] uppercase tracking-[0.2em] opacity-60">{k}</dt>
          <dd className="mt-1 truncate text-[11px] uppercase">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
