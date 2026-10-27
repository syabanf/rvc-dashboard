import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { useStore } from '../../app/store'
import { BOOKING_STATUSES, FEED_POOL, MEMBERS, MIX, RECENT, SELL_THROUGH, STOCK, WEEKS, weekTotal, type AdminBooking, type BookingStatus } from '../../data/admin'
import { EVENTS, eventById, MERCH } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { Columns, Donut, Line, Meter } from '../../ui/charts'
import { CountUp } from '../../ui/motion'
import { stagger } from '../../ui/reveal'
import { useDialog } from '../../ui/useDialog'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, inputCls, StatusTag } from '../../ui/ui'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const idrShort = (n: number) => `IDR ${compact.format(n)}`
const ago = (at: number) => {
  const m = Math.round((Date.now() - at) / 60_000)
  return m ? `${m}m` : 'now'
}
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

function Card({ title, kicker, action, children, className = '', id }: { title: string; kicker?: string; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} data-reveal className={`scroll-mt-6 border border-line bg-panel p-5 md:p-6 ${className}`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          {kicker && <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-subtle">{kicker}</p>}
          <h2 className="text-sm font-bold uppercase tracking-[0.15em]">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Kpis() {
  const revenue = WEEKS.reduce((s, w) => s + weekTotal(w), 0)
  const items = [
    { label: 'Revenue, 12 wks', value: revenue, format: idrShort, delta: '+212%' },
    { label: 'Tickets sold', value: 18_460, format: (n: number) => n.toLocaleString('en'), delta: '+64%' },
    { label: 'RAW members', value: MEMBERS[MEMBERS.length - 1], format: (n: number) => n.toLocaleString('en'), delta: `+${MEMBERS[MEMBERS.length - 1] - MEMBERS[MEMBERS.length - 2]} this wk` },
    { label: 'Merch orders', value: 3_412, format: (n: number) => n.toLocaleString('en'), delta: '+41%' },
  ]
  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
      {items.map((k, i) => (
        <div key={k.label} data-reveal style={stagger(i, 90)} className="bg-panel p-5 md:p-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted">{k.label}</p>
          <p className="mt-3 font-display text-2xl md:text-4xl">
            <CountUp value={k.value} format={k.format} />
          </p>
          <p className="mt-2 text-[11px] text-body">
            <span className="text-fg">▲ {k.delta}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

function Revenue() {
  const [sel, setSel] = useState(WEEKS.length - 1)
  const w = WEEKS[sel]
  return (
    <Card title="Weekly revenue" kicker="Last 12 weeks" className="lg:col-span-2" action={<span className="text-[10px] uppercase tracking-[0.2em] text-muted">Click a week</span>}>
      <div className="grid gap-6 md:grid-cols-[1fr_12rem]">
        <Columns data={WEEKS.map((x) => ({ label: x.label, value: weekTotal(x) }))} selected={sel} onSelect={setSel} format={idrShort} />
        <dl key={sel} className="animate-rise space-y-4 border-t border-line pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">Week of {w.label}</dt>
            <dd className="mt-1 font-display text-3xl tabular">{idrShort(weekTotal(w))}</dd>
          </div>
          {(
            [
              ['Tickets', w.tickets],
              ['Merch', w.merch],
              ['Membership', w.members],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[11px] uppercase tracking-wider">
                <dt className="text-muted">{k}</dt>
                <dd className="tabular">{idrShort(v)}</dd>
              </div>
              <div className="mt-1.5 h-1 bg-raised">
                <div className="h-full bg-fg transition-[width] duration-700" style={{ width: `${(v / weekTotal(w)) * 100}%` }} />
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}

function SellThrough() {
  return (
    <Card id="events" title="Sell-through" kicker="Upcoming events">
      <ul className="space-y-5">
        {SELL_THROUGH.map((s, i) => {
          const ev = eventById(s.eventId)!
          const v = s.sold / s.capacity
          return (
            <li key={s.eventId}>
              <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate font-bold uppercase">{ev.title}</span>
                <span className="shrink-0 tabular text-muted">{Math.round(v * 100)}%</span>
              </div>
              <div className="h-2 bg-raised">
                <div style={{ '--v': v, '--d': `${i * 150}ms` } as CSSProperties} className={`fill h-full ${v > 0.8 ? 'bg-signal' : 'bg-fg'}`} />
              </div>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-subtle tabular">
                {s.label} {s.sold.toLocaleString('en')} / {s.capacity.toLocaleString('en')}
              </p>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function Bookings() {
  const { bookings, toast } = useStore()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useFilter<BookingStatus>('status')
  const [eventId, setEventId] = useFilter<string>('event')
  const q = params.get('q') ?? ''
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({})
  const [open, setOpen] = useState<AdminBooking | null>(null)
  const ref = useDialog(open !== null, () => setOpen(null))

  // Bookings made on this device through /rsvp show up first.
  const all = useMemo<AdminBooking[]>(
    () => [
      ...bookings.map((b) => ({ code: b.code, name: b.name, eventId: b.eventId, tier: eventById(b.eventId)?.tiers.find((t) => t.id === b.tierId)?.name ?? '', qty: b.qty, total: b.total, status: 'Paid' as const, at: b.createdAt })),
      ...RECENT,
    ].map((b) => ({ ...b, status: overrides[b.code] ?? b.status })),
    [bookings, overrides],
  )
  const byEvent = all.filter((b) => eventId === 'All' || b.eventId === eventId)
  const rows = byEvent.filter((b) => (status === 'All' || b.status === status) && (!q || `${b.name} ${b.code}`.toLowerCase().includes(q.toLowerCase())))
  const setQ = (v: string) =>
    setParams(
      (p) => {
        if (v) p.set('q', v)
        else p.delete('q')
        return p
      },
      { replace: true },
    )
  const clear = () => setParams({}, { replace: true })
  const refund = (b: AdminBooking) => {
    setOverrides((o) => ({ ...o, [b.code]: 'Refunded' }))
    setOpen({ ...b, status: 'Refunded' })
    toast('Marked as refunded', `${b.code}. Payment provider refunds start once it is connected.`)
  }
  const tone = (s: BookingStatus) => (s === 'Paid' ? 'solid' : s === 'Pending' ? 'live' : 'muted')

  return (
    <Card id="bookings" title="Bookings" kicker={`${all.length} recent`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 basis-full lg:flex-1 lg:basis-auto">
          <Chips label="Filter by status" options={BOOKING_STATUSES} value={status} onChange={setStatus} counts={countBy(byEvent, (b) => b.status)} />
        </div>
        <label className="relative w-full sm:w-56">
          <span className="sr-only">Search name or code</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or code" className={`${inputCls} h-10 pl-9`} />
        </label>
        <select aria-label="Filter by event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={`${inputCls} h-10 w-full sm:w-56`}>
          <option value="All">All events</option>
          {EVENTS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="mt-4">
          <Empty title="No bookings match" action={<button type="button" className={btn('line')} onClick={clear}>Clear filters</button>} />
        </div>
      ) : (
        <div className="mt-2 md:overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="hidden text-[10px] uppercase tracking-[0.2em] text-subtle md:table-header-group">
              <tr className="border-b border-line">
                {['Code', 'Guest', 'Event', 'Ticket', 'Total', 'Status', 'Time'].map((h) => (
                  <th key={h} className="py-3 pr-4 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {rows.map((b, i) => (
                <tr
                  key={b.code}
                  data-reveal
                  style={stagger(i, 40)}
                  tabIndex={0}
                  onClick={() => setOpen(b)}
                  onKeyDown={(e) => e.key === 'Enter' && setOpen(b)}
                  className="grid cursor-pointer grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b border-line py-4 transition-colors hover:bg-raised md:table-row md:py-0"
                >
                  <td className="font-mono font-bold md:py-3.5 md:pr-4">{b.code}</td>
                  <td className="order-3 uppercase md:py-3.5 md:pr-4">{b.name}</td>
                  <td className="order-5 col-span-2 truncate text-muted md:max-w-[14rem] md:py-3.5 md:pr-4">{eventById(b.eventId)?.title}</td>
                  <td className="hidden text-muted md:table-cell md:py-3.5 md:pr-4">
                    {b.qty} × {b.tier}
                  </td>
                  <td className="order-4 text-right tabular md:py-3.5 md:pr-4 md:text-left">{b.total ? formatIDR(b.total) : 'Free'}</td>
                  <td className="order-2 text-right md:py-3.5 md:pr-4 md:text-left">
                    <StatusTag tone={tone(b.status)}>{b.status}</StatusTag>
                  </td>
                  <td className="hidden text-muted tabular md:table-cell md:py-3.5">{timeOf(b.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close booking" onClick={() => setOpen(null)} className="absolute inset-0 bg-black/70" />
          <div ref={ref} role="dialog" aria-modal="true" aria-label={`Booking ${open.code}`} className="animate-rise absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-panel">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <p className="font-mono text-sm font-bold">{open.code}</p>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close booking" className="grid size-10 place-items-center hover:bg-hover">
                <X className="size-5" />
              </button>
            </div>
            <dl className="flex-1 space-y-5 overflow-y-auto p-5">
              {[
                ['Guest', open.name],
                ['Event', eventById(open.eventId)?.title],
                ['Ticket', `${open.qty} × ${open.tier}`],
                ['Total', open.total ? formatIDR(open.total) : 'Free'],
                ['Booked', `${new Date(open.at).toLocaleDateString('en-GB')} ${timeOf(open.at)}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
                  <dd className="mt-1 text-sm uppercase">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted">Status</dt>
                <dd>
                  <StatusTag tone={tone(open.status)}>{open.status}</StatusTag>
                </dd>
              </div>
            </dl>
            <div className="grid gap-2 border-t border-line p-5">
              <button type="button" className={btn('solid')} onClick={() => toast('Ticket resend queued', `${open.code} to ${open.name}. Email delivery starts with the backend.`)}>
                Resend ticket
              </button>
              <button type="button" disabled={open.status === 'Refunded' || !open.total} className={btn('line')} onClick={() => refund(open)}>
                Mark as refunded
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function Stock() {
  return (
    <Card id="merch" title="Merch stock" kicker="Units left" className="lg:col-span-2">
      <ul className="divide-y divide-line">
        {STOCK.map((s) => {
          const item = MERCH.find((m) => m.id === s.itemId)!
          const ratio = s.left / s.of
          const low = ratio < 0.1
          return (
            <li key={s.itemId} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[1fr_auto_5rem]">
              <span className="truncate text-xs font-bold uppercase">{item.name}</span>
              <span className="order-3 col-span-2 sm:order-none sm:col-span-1">
                <Meter ratio={ratio} low={low} />
              </span>
              <span className={`text-right text-xs tabular ${low ? 'text-signal' : 'text-muted'}`}>{s.left === 0 ? 'Sold out' : `${s.left} / ${s.of}`}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function Feed() {
  const [items, setItems] = useState(() => FEED_POOL.slice(0, 4).map((text, i) => ({ id: i, text, at: Date.now() - (i + 1) * 240_000 })))
  const next = useRef(4)
  useEffect(() => {
    const t = setInterval(() => {
      const id = next.current++
      setItems((list) => [{ id, text: FEED_POOL[id % FEED_POOL.length], at: Date.now() }, ...list].slice(0, 6))
    }, 4500)
    return () => clearInterval(t)
  }, [])
  return (
    <Card title="Live activity" kicker="Simulated feed" action={<StatusTag tone="live">Live</StatusTag>}>
      <ol aria-live="polite" className="space-y-px">
        {items.map((it, i) => (
          <li key={it.id} className={`flex items-start gap-3 px-2 py-2.5 text-xs ${i === 0 ? 'animate-rise bg-raised' : ''}`}>
            <span className={`mt-1 size-1.5 shrink-0 rounded-full ${i === 0 ? 'bg-signal' : 'bg-line-strong'}`} />
            <span className="flex-1 leading-relaxed">{it.text}</span>
            <span className="shrink-0 text-[10px] text-subtle tabular">{ago(it.at)}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}

export default function Overview() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 py-6">
      <section id="overview" className="scroll-mt-6 space-y-4">
        <Kpis />
        <div className="grid gap-4 lg:grid-cols-3">
          <Revenue />
          <Card title="Revenue mix" kicker="Last 12 weeks">
            <Donut slices={MIX} format={idrShort} center="Total" />
          </Card>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <SellThrough />
        <Card id="members" title="RAW members" kicker="Cumulative" className="lg:col-span-2">
          <Line values={MEMBERS} labels={WEEKS.map((w) => w.label)} />
        </Card>
      </div>
      <Bookings />
      <div className="grid gap-4 lg:grid-cols-3">
        <Stock />
        <Feed />
      </div>
    </div>
  )
}
