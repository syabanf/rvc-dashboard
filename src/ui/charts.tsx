import { useState, type CSSProperties, type KeyboardEvent } from 'react'

type Datum = { label: string; value: number }

/** Hatched capsule columns. The selected one turns signal red; arrow keys move the selection. */
export function Columns({ data, selected, onSelect, format }: { data: Datum[]; selected: number; onSelect: (i: number) => void; format: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value))
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') onSelect(Math.min(data.length - 1, selected + 1))
    if (e.key === 'ArrowLeft') onSelect(Math.max(0, selected - 1))
  }
  return (
    <div role="radiogroup" aria-label="Weekly revenue" onKeyDown={onKey} className="flex h-64 items-end gap-1.5 sm:gap-2.5">
      {data.map((d, i) => {
        const on = i === selected
        return (
          <button
            key={d.label}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            aria-label={`${d.label}: ${format(d.value)}`}
            onClick={() => onSelect(i)}
            className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span className={`pointer-events-none absolute -top-1 z-10 whitespace-nowrap ${i === 0 ? 'left-0' : i >= data.length - 2 ? 'right-0' : 'left-1/2 -translate-x-1/2'} px-2 py-1 text-[10px] font-bold tabular transition-opacity ${on ? 'bg-signal text-white opacity-100' : 'bg-fg text-void opacity-0 group-hover:opacity-100'}`}>{format(d.value)}</span>
            <span className="flex w-full flex-1 items-end">
              <span
                style={{ '--h': `${Math.max(4, (d.value / max) * 86)}%`, '--d': `${i * 45}ms` } as CSSProperties}
                className={`bar block w-full rounded-full border ${on ? 'border-signal bg-signal shadow-[0_0_24px_rgba(255,59,48,0.45)]' : 'hatch border-line-strong bg-raised group-hover:border-muted'}`}
              />
            </span>
            <span className={`text-[9px] uppercase tracking-wider sm:text-[10px] ${on ? 'text-fg' : 'text-subtle'}`}>{d.label.split(' ')[0]}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Gap donut. Segments draw in on reveal; the hovered or focused key thickens and the rest dim. */
export function Donut({ slices, format, center }: { slices: { key: string; value: number; color: string }[]; format: (n: number) => string; center: string }) {
  const [active, setActive] = useState<string | null>(null)
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = 42
  const c = 2 * Math.PI * r
  const gap = 3
  const segs = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((sum, x) => sum + x.value, 0)
    return { ...s, i, len: Math.max(0, (s.value / total) * c - gap), offset: -(before / total) * c }
  })
  const hot = segs.find((s) => s.key === active)

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[11rem_1fr] lg:grid-cols-1">
      <div className="relative mx-auto size-44">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-raised)" strokeWidth="9" />
          {segs.map((s) => (
            <circle
              key={s.key}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeLinecap="butt"
              strokeDashoffset={s.offset}
              strokeWidth={active === s.key ? 13 : 9}
              opacity={active && active !== s.key ? 0.3 : 1}
              style={{ '--len': s.len, '--c': c, '--d': `${s.i * 180}ms` } as CSSProperties}
              className="donut-seg"
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{hot ? hot.key : center}</span>
          <span className="font-display text-xl tabular">{hot ? `${Math.round((hot.value / total) * 100)}%` : format(total)}</span>
        </div>
      </div>
      <ul className="space-y-1">
        {segs.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(s.key)}
              onBlur={() => setActive(null)}
              className={`flex w-full items-center gap-3 px-2 py-2 text-left text-xs transition-colors ${active === s.key ? 'bg-raised' : 'hover:bg-raised'}`}
            >
              <span className="size-2.5 shrink-0" style={{ background: s.color }} />
              <span className="flex-1 uppercase tracking-wider">{s.key}</span>
              <span className="whitespace-nowrap tabular text-muted">{format(s.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Monotone line that draws itself on reveal, with a fading area wash and a pinging last point. */
export function Line({ values, labels }: { values: number[]; labels: string[] }) {
  const w = 600
  const h = 200
  const max = Math.max(...values) * 1.1
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - (v / max) * h] as const)
  const d = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`
    const [px, py] = pts[i - 1]
    const cx = (px + x) / 2
    return `${acc} C${cx},${py} ${cx},${y} ${x},${y}`
  }, '')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <div>
      <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-48 w-full overflow-visible" role="img" aria-label={`Members grew from ${values[0]} to ${values[values.length - 1]}`}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="var(--color-line)" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${d} L${w},${h} L0,${h} Z`} fill="var(--color-fg)" fillOpacity="0.08" className="wash" />
        <path d={d} fill="none" stroke="var(--color-fg)" strokeWidth="2" pathLength={1} vectorEffect="non-scaling-stroke" className="draw" />
      </svg>
      <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(lx / w) * 100}%`, top: `${(ly / h) * 100}%` }}>
        <span className="ping absolute inset-0 rounded-full bg-signal" />
        <span className="absolute inset-0 rounded-full bg-signal" />
      </span>
      </div>
      <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-subtle">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  )
}

/** Barcode meter: ticks light up one after another on reveal. Low stock reads red. */
export function Meter({ ratio, low }: { ratio: number; low?: boolean }) {
  const ticks = 28
  const on = Math.round(ratio * ticks)
  return (
    <div className="flex h-5 gap-[3px]" aria-hidden>
      {Array.from({ length: ticks }, (_, i) => (
        <span key={i} style={{ '--d': `${i * 18}ms` } as CSSProperties} className={`tick w-[3px] ${i < on ? 'on' : ''} ${low ? 'bg-signal' : 'bg-fg'}`} />
      ))}
    </div>
  )
}
