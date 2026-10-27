import { Lock } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'

export function Halftone({ lines, as: Tag = 'h1', className = '' }: { lines: string[]; as?: 'h1' | 'h2' | 'p'; className?: string }) {
  return (
    <Tag data-reveal className={`halftone font-display uppercase leading-[0.86] tracking-tight ${className}`} aria-label={lines.join(' ')}>
      <span aria-hidden className="halftone-ink px-[0.06em] py-[0.04em]">
        {lines.map((l) => (
          <span key={l} className="block whitespace-nowrap">
            {l}
          </span>
        ))}
      </span>
    </Tag>
  )
}

const BTN = {
  solid: 'btn-sweep bg-fg text-void [--sweep:var(--color-signal)] hover:text-white',
  line: 'btn-sweep border border-fg text-fg hover:text-void',
  ghost: 'text-muted underline-offset-4 hover:text-fg hover:underline',
}

export const btn = (tone: keyof typeof BTN = 'solid', extra = '') =>
  `inline-flex h-11 items-center justify-center gap-2 px-5 text-xs font-bold uppercase tracking-[0.18em] transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${BTN[tone]} ${extra}`

export function PageHead({ index, title, kicker, children }: { index: string; title: string; kicker: string; children?: ReactNode }) {
  return (
    <header className="grid gap-6 border-b border-line pb-8 pt-10 md:grid-cols-[1fr_minmax(0,22rem)] md:items-end md:pt-16">
      <div>
        <p data-reveal className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
          {index} / {kicker}
        </p>
        <Halftone lines={title.split('\n')} className="text-[clamp(2.75rem,9vw,7.5rem)] [--ht-dot:6px]" />
      </div>
      {children && (
        <div data-reveal style={{ '--d': '250ms' } as CSSProperties} className="text-sm leading-relaxed text-body">
          {children}
        </div>
      )}
    </header>
  )
}

export function Chips<T extends string>({ label, options, value, onChange, counts }: { label: string; options: readonly T[]; value: T | 'All'; onChange: (v: T | 'All') => void; counts?: Record<string, number> }) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-5 md:mx-0 md:flex-wrap md:px-0">
      {(['All', ...options] as (T | 'All')[]).map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`h-9 shrink-0 border px-4 text-[11px] uppercase tracking-[0.18em] transition-colors ${value === o ? 'border-fg bg-fg text-void' : 'border-line-strong text-muted hover:border-fg hover:text-fg'}`}
        >
          {o}
          {counts && <span className="ml-2 tabular opacity-60">{counts[o] ?? 0}</span>}
        </button>
      ))}
    </div>
  )
}

export function MembersLock({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/raw" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/55 text-center backdrop-blur-md transition-colors hover:bg-void/40">
      <Lock className="size-5" aria-hidden />
      <span className="text-[10px] font-bold uppercase tracking-[0.25em]">RAW members</span>
      {!compact && <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Unlock in the vault</span>}
    </Link>
  )
}

export function Empty({ title, action }: { title: string; action: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted">{title}</p>
      {action}
    </div>
  )
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-signal">{error}</span>}
    </label>
  )
}

export const inputCls =
  'h-12 w-full border border-line-strong bg-panel px-4 text-base text-fg placeholder:text-subtle focus:border-fg focus:outline-none sm:text-sm'

export function StatusTag({ tone, children }: { tone: 'live' | 'muted' | 'solid'; children: ReactNode }) {
  const cls = { live: 'border-signal bg-void/80 text-signal', muted: 'border-line-strong bg-void/80 text-muted', solid: 'border-fg bg-fg text-void' }[tone]
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 border px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${cls}`}>
      {tone === 'live' && <span className="size-1.5 animate-blink rounded-full bg-signal" />}
      {children}
    </span>
  )
}
