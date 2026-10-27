import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Sparkline } from '../../ui/charts'
import { CountUp } from '../../ui/motion'
import { stagger } from '../../ui/reveal'
import { useDialog } from '../../ui/useDialog'
import { btn, Empty } from '../../ui/ui'


export function PageTitle({ title, sub, actions }: { title: string; sub: string; actions?: ReactNode }) {
  return (
    <div data-reveal className="flex flex-wrap items-end justify-between gap-4 pb-2 pt-6">
      <div>
        <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">
          {title}
          <span className="text-signal">.</span>
        </h2>
        <p className="mt-2 text-xs text-muted">{sub}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, kicker, action, children, className = '' }: { title: string; kicker?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section data-reveal className={`min-w-0 border border-line bg-panel p-5 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {kicker && <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-subtle">{kicker}</p>}
          <h3 className="text-xs font-bold uppercase tracking-[0.15em]">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export type KpiItem = { label: string; value: number; format: (n: number) => string; delta?: number; trend?: number[]; note?: string }

export function Kpis({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line xl:grid-cols-4">
      {items.map((k, i) => (
        <div key={k.label} data-reveal style={stagger(i, 80)} className="flex min-w-0 flex-col gap-3 bg-panel p-4 md:p-5">
          <p className="truncate text-[10px] uppercase tracking-[0.25em] text-muted">{k.label}</p>
          <div className="flex items-end justify-between gap-3">
            <p className="font-display text-xl md:text-3xl">
              <CountUp value={k.value} format={k.format} />
            </p>
            {k.trend && (
              <div className="hidden w-20 shrink-0 sm:block">
                <Sparkline values={k.trend} />
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted">
            {k.delta !== undefined && <span className={k.delta >= 0 ? 'text-fg' : 'text-signal'}>{k.delta >= 0 ? '▲' : '▼'} {Math.abs(k.delta)}% </span>}
            {k.note}
          </p>
        </div>
      ))}
    </div>
  )
}

export type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; className?: string; csv?: (row: T) => string | number }

const PAGE = 10

/** Dense table with paging, optional row selection and a CSV export of every filtered row. */
export function DataTable<T>({ rows, columns, rowKey, onOpen, selected, onSelect, empty, exportName }: { rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; onOpen?: (r: T) => void; selected?: Set<string>; onSelect?: (s: Set<string>) => void; empty: ReactNode; exportName?: string }) {
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(rows.length / PAGE))
  const current = Math.min(page, pages - 1)
  const view = rows.slice(current * PAGE, current * PAGE + PAGE)
  const allOn = !!selected && view.length > 0 && view.every((r) => selected.has(rowKey(r)))

  const toggle = (k: string) => {
    if (!selected || !onSelect) return
    const next = new Set(selected)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    onSelect(next)
  }
  const toggleAll = () => {
    if (!selected || !onSelect) return
    const next = new Set(selected)
    view.forEach((r) => (allOn ? next.delete(rowKey(r)) : next.add(rowKey(r))))
    onSelect(next)
  }
  const exportCsv = () => {
    const cols = columns.filter((c) => c.csv)
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const body = [cols.map((c) => esc(c.header)), ...rows.map((r) => cols.map((c) => esc(c.csv!(r))))].map((l) => l.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
    a.download = `${exportName}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (rows.length === 0) return <div className="mt-2">{empty}</div>

  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-subtle">
            <tr className="border-b border-line">
              {selected && (
                <th className="w-8 py-3">
                  <input type="checkbox" aria-label="Select page" checked={allOn} onChange={toggleAll} className="size-3.5 accent-fg" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={`py-3 pr-4 font-normal ${c.className ?? ''}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r, i) => {
              const k = rowKey(r)
              return (
                <tr
                  key={k}
                  data-reveal
                  style={{ '--d': `${i * 30}ms` } as CSSProperties}
                  tabIndex={onOpen ? 0 : undefined}
                  onClick={() => onOpen?.(r)}
                  onKeyDown={(e) => e.key === 'Enter' && onOpen?.(r)}
                  className={`border-b border-line transition-colors ${onOpen ? 'cursor-pointer hover:bg-raised' : ''} ${selected?.has(k) ? 'bg-raised' : ''}`}
                >
                  {selected && (
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${k}`} checked={selected.has(k)} onChange={() => toggle(k)} className="size-3.5 accent-fg" />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={`whitespace-nowrap py-3 pr-4 ${c.className ?? ''}`}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.15em] text-muted">
        <span className="tabular">
          {current * PAGE + 1}–{Math.min(rows.length, (current + 1) * PAGE)} of {rows.length}
        </span>
        <div className="flex items-center gap-1">
          {exportName && (
            <button type="button" onClick={exportCsv} className="mr-2 flex h-8 items-center gap-1.5 border border-line-strong px-3 hover:border-fg hover:text-fg">
              <Download className="size-3.5" /> CSV
            </button>
          )}
          <button type="button" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)} className="grid size-8 place-items-center border border-line-strong hover:border-fg disabled:opacity-30">
            <ChevronLeft className="size-4" />
          </button>
          <span className="w-14 text-center tabular">
            {current + 1} / {pages}
          </span>
          <button type="button" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="grid size-8 place-items-center border border-line-strong hover:border-fg disabled:opacity-30">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ClearFilters({ onClear, title = 'Nothing matches these filters' }: { onClear: () => void; title?: string }) {
  return (
    <Empty
      title={title}
      action={
        <button type="button" className={btn('line')} onClick={onClear}>
          Clear filters
        </button>
      }
    />
  )
}

export function Drawer({ title, onClose, children, footer }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useDialog(true, onClose)
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} className="animate-rise absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-panel">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <div className="min-w-0 truncate font-mono text-sm font-bold">{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="grid gap-2 border-t border-line p-5">{footer}</div>}
      </div>
    </div>
  )
}

export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
          <dd className="mt-1 text-sm uppercase">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
