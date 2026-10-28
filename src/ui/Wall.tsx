import { Lock } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

const GAP = 14
const STEP = 180

type Tile = { left: number; top: number; width: number; height: number; tilt: number }

/** Stable 0..1 noise per tile, so the wall keeps its shape between renders. */
const noise = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/** Packs tiles into rows of equal width, so the block repeats on every side without seams. */
function layout(ratios: number[], rowH: number) {
  const rows = Math.min(5, Math.max(1, Math.round(Math.sqrt(ratios.length / 2.5))))
  const natural = ratios.map((r, i) => rowH * r * (0.88 + 0.24 * noise(i, 1)))
  const width = Math.round(natural.reduce((a, w) => a + w + GAP, 0) / rows)
  const groups: number[][] = [[]]
  let run = 0
  natural.forEach((w, i) => {
    if (run > 0 && run + w / 2 > width && groups.length < rows) {
      groups.push([])
      run = 0
    }
    groups[groups.length - 1].push(i)
    run += w + GAP
  })
  const tiles: Tile[] = []
  groups.forEach((group, r) => {
    const k = (width - GAP * group.length) / group.reduce((a, i) => a + natural[i], 0)
    let x = 0
    for (const i of group) {
      const height = rowH * (0.95 + 0.05 * noise(i, 2))
      tiles[i] = { left: x, top: r * (rowH + GAP) + (rowH - height) * noise(i, 3), width: natural[i] * k, height, tilt: (noise(i, 4) - 0.5) * 1.8 }
      x += natural[i] * k + GAP
    }
  })
  return { tiles, width, height: groups.length * (rowH + GAP) }
}

/**
 * An endless plane of tiles: one block of items repeated in every direction.
 * Drag, scroll or press the arrow keys to move it; Enter opens the tile in the middle.
 */
export function Wall<T extends { id: string }>({ items, ratio, label, onOpen, children }: { items: T[]; ratio: (item: T) => number; label: string; onOpen: (item: T) => void; children: (item: T) => ReactNode }) {
  const view = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -120, y: -40 })
  const target = useRef({ x: -120, y: -40 })
  const moved = useRef(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const rowH = size.w < 700 ? 250 : 370
  const { tiles, width, height } = useMemo(() => layout(items.map(ratio), rowH), [items, ratio, rowH])
  const cols = size.w ? Math.ceil(size.w / width) + 1 : 0
  const rows = size.h ? Math.ceil(size.h / height) + 1 : 0

  useEffect(() => {
    const el = view.current!
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The plane eases toward its target every frame; drags move both so the tile stays under the finger.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = pos.current
      const t = target.current
      p.x += (t.x - p.x) * 0.14
      p.y += (t.y - p.y) * 0.14
      if (plane.current) plane.current.style.transform = `translate3d(${mod(p.x, width) - width}px, ${mod(p.y, height) - height}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [width, height])

  useEffect(() => {
    const el = view.current!
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      target.current.x -= e.deltaX
      target.current.y -= e.deltaY
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  }, [])

  const down = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    moved.current = 0
    let last = { x: e.clientX, y: e.clientY }
    let vel = { x: 0, y: 0 }
    const move = (m: PointerEvent) => {
      vel = { x: m.clientX - last.x, y: m.clientY - last.y }
      last = { x: m.clientX, y: m.clientY }
      moved.current += Math.abs(vel.x) + Math.abs(vel.y)
      for (const p of [pos.current, target.current]) {
        p.x += vel.x
        p.y += vel.y
      }
    }
    const up = () => {
      target.current.x += vel.x * 14
      target.current.y += vel.y * 14
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const key = (e: KeyboardEvent) => {
    const step = { ArrowLeft: [STEP, 0], ArrowRight: [-STEP, 0], ArrowUp: [0, STEP], ArrowDown: [0, -STEP] }[e.key]
    if (step) {
      e.preventDefault()
      target.current.x += step[0]
      target.current.y += step[1]
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const r = view.current!.getBoundingClientRect()
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest<HTMLElement>('[data-tile]')
      if (hit) onOpen(items[Number(hit.dataset.tile)])
    }
  }

  return (
    <div ref={view} tabIndex={0} role="region" aria-label={label} onPointerDown={down} onKeyDown={key} className="group/wall absolute inset-0 cursor-grab touch-none select-none overflow-hidden outline-none active:cursor-grabbing">
      <div ref={plane} aria-hidden className="absolute left-0 top-0 will-change-transform">
        {Array.from({ length: rows + 1 }, (_, r) =>
          Array.from({ length: cols + 1 }, (_, c) => (
            <div key={`${r}-${c}`} className="absolute" style={{ left: c * width, top: r * height, width, height }}>
              {items.map((item, i) => {
                const t = tiles[i]
                return (
                  <div
                    key={item.id}
                    data-tile={i}
                    data-cursor="View"
                    onClick={() => moved.current < 6 && onOpen(item)}
                    style={{ left: t.left, top: t.top, width: t.width, height: t.height, rotate: `${t.tilt}deg`, animation: `rise 0.6s cubic-bezier(0.2,0.7,0.2,1) ${(i % 12) * 40}ms both` }}
                    className="group absolute cursor-pointer overflow-hidden bg-panel shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[scale,box-shadow] duration-300 hover:z-[2] hover:scale-[1.025] hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)] [&_img]:pointer-events-none"
                  >
                    {children(item)}
                  </div>
                )
              })}
            </div>
          )),
        )}
      </div>
      {/* Crosshair for keyboard users: Enter opens whatever sits under it. */}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden size-10 -translate-x-1/2 -translate-y-1/2 border-2 border-signal group-focus-visible/wall:block" />
    </div>
  )
}

/** Full-height page around a Wall: filter chips on top, a title card bottom-left, a drag hint. */
export function WallPage({ kicker, title, intro, filters, empty, children }: { kicker: string; title: string; intro: ReactNode; filters: ReactNode; empty?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative h-[calc(100dvh-4rem)] overflow-hidden bg-void">
      {empty ? <div className="grid h-full place-items-center px-4">{empty}</div> : children}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 md:px-6 [&_button]:pointer-events-auto [&_button[aria-pressed=false]]:bg-void/90">{filters}</div>
      <section className="absolute bottom-4 left-4 z-10 w-[min(330px,calc(100%-2rem))] border border-fg bg-void p-4 md:bottom-6 md:left-6 md:p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{kicker}</p>
        <h1 className="mt-1 font-display text-2xl uppercase leading-none md:text-3xl">{title}</h1>
        <p className="mt-2 hidden text-sm leading-snug text-body sm:block">{intro}</p>
      </section>
      <span aria-hidden className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 bg-fg px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-void lg:block">
        (Drag anywhere)
      </span>
    </div>
  )
}

/** Blurred cover with a RAW badge for members-only tiles. Tapping the tile leads to the vault. */
export function WallLock() {
  return (
    <>
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/45 text-[10px] font-bold uppercase tracking-[0.25em] backdrop-blur-md">
        <Lock className="size-5" aria-hidden /> RAW members
      </span>
      <span className="absolute left-2.5 top-2.5 bg-fg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-void">RAW</span>
    </>
  )
}

/** Ink caption bar that slides up on hover; always shown on touch screens. */
export function WallCaption({ title, meta }: { title: string; meta: string }) {
  return (
    <span className="absolute inset-x-0 bottom-0 flex justify-between gap-3 bg-fg px-3 py-2.5 text-[10px] uppercase tracking-[0.15em] text-void transition-transform duration-300 sm:translate-y-full sm:group-hover:translate-y-0">
      <span className="truncate">{title}</span>
      <span className="hidden shrink-0 opacity-70 sm:inline">{meta}</span>
    </span>
  )
}
