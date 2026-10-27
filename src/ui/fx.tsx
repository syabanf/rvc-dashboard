import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches

/** Heading text that rises letter by letter from behind a mask when it scrolls into view. */
export function SplitText({ text, className = '', step = 22 }: { text: string; className?: string; step?: number }) {
  let i = 0
  return (
    <span data-reveal className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              {[...word].map((c, k) => (
                <span key={k} style={{ '--i': i++, '--step': `${step}ms` } as CSSProperties} className="split-char inline-block">
                  {c}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}

/** Paragraph that fades in word by word, from blurred and faint to sharp. */
export function Words({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span data-reveal className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((w, i) => (
          <span key={i}>
            {i > 0 && ' '}
            <span style={{ '--i': i } as CSSProperties} className="split-word inline-block">
              {w}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}

/**
 * Water ripple on hover or tap: an SVG displacement wobble that settles over a second,
 * plus rings that spread from the pointer.
 */
export function Ripple({ children, cursor = 'View' }: { children: ReactNode; cursor?: string }) {
  const id = `rip${useId().replace(/[^a-z0-9]/gi, '')}`
  const box = useRef<HTMLDivElement>(null)
  const turb = useRef<SVGFETurbulenceElement>(null)
  const disp = useRef<SVGFEDisplacementMapElement>(null)
  const [active, setActive] = useState(false)
  const [rings, setRings] = useState<{ key: number; x: number; y: number }[]>([])

  // Cards often lay a link or button over the image, so the trigger is the card, not the image.
  useEffect(() => {
    const el = box.current
    const host = el?.parentElement?.closest<HTMLElement>('a, li, figure, section') ?? el?.parentElement
    if (!el || !host) return
    let raf = 0
    const start = (e: PointerEvent) => {
      if (calm() && e.type === 'pointerenter') return
      const r = el.getBoundingClientRect()
      const key = performance.now()
      setRings((list) => [...list.slice(-2), { key, x: e.clientX - r.left, y: e.clientY - r.top }])
      setTimeout(() => setRings((list) => list.filter((x) => x.key !== key)), 1100)
      if (calm()) return
      cancelAnimationFrame(raf)
      setActive(true)
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1100)
        const ease = 1 - Math.pow(1 - p, 3)
        disp.current?.setAttribute('scale', String(34 * (1 - ease) * Math.cos(p * Math.PI * 3)))
        turb.current?.setAttribute('baseFrequency', `${0.008 + 0.012 * p} ${0.04 - 0.02 * p}`)
        if (p < 1) raf = requestAnimationFrame(tick)
        else setActive(false)
      }
      raf = requestAnimationFrame(tick)
    }
    host.addEventListener('pointerenter', start)
    host.addEventListener('pointerdown', start)
    return () => {
      cancelAnimationFrame(raf)
      host.removeEventListener('pointerenter', start)
      host.removeEventListener('pointerdown', start)
    }
  }, [])

  return (
    <div ref={box} data-cursor={cursor} className="relative size-full overflow-hidden">
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turb} type="turbulence" baseFrequency="0.008 0.04" numOctaves="2" seed="7" />
          <feDisplacementMap ref={disp} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className={`size-full transition-transform duration-700 ${active ? 'scale-[1.04]' : ''}`} style={{ filter: active ? `url(#${id})` : undefined }}>
        {children}
      </div>
      {rings.map((r) => (
        <span key={r.key} aria-hidden style={{ left: r.x, top: r.y }} className="ripple-ring" />
      ))}
    </div>
  )
}

/** 3D tilt toward the pointer with a moving glare. */
export function Tilt({ children, className = '', max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (calm()) return
    const el = ref.current!
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * max}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * max}deg`)
    el.style.setProperty('--gx', `${x * 100}%`)
    el.style.setProperty('--gy', `${y * 100}%`)
  }
  const leave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>
      {children}
      <span aria-hidden className="tilt-glare" />
    </div>
  )
}

/** Wrapper that pulls its child toward the pointer, then springs back. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const move = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (calm()) return
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return (
    <span ref={ref} onPointerMove={move} onPointerLeave={leave} className="inline-flex transition-transform duration-300 ease-out">
      {children}
    </span>
  )
}

/** Ring that trails the pointer, grows over links and shows a label over media. Fine pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [hot, setHot] = useState(false)
  const [on] = useState(() => !calm())

  useEffect(() => {
    if (!on) return
    let x = innerWidth / 2
    let y = innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button')
      setLabel(t?.dataset.cursor ?? '')
      setHot(!!t)
    }
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }
    document.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      document.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [on])

  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] mix-blend-difference">
      <div ref={dot} className="absolute -left-1 -top-1 size-2 rounded-full bg-white" />
      <div ref={ring} className="absolute left-0 top-0">
        <div className={`grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 ${label ? 'size-20 bg-white text-black' : hot ? 'size-12' : 'size-8'}`}>
          <span className={label ? 'text-black' : 'hidden'}>{label}</span>
        </div>
      </div>
    </div>
  )
}
