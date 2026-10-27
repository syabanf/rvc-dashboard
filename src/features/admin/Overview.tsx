import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { BOOKINGS, FEED_POOL, MEMBERS, MIX, ORDERS, SELL_THROUGH, WEEKS, weekTotal, type Week } from '../../data/admin'
import { eventById, MERCH } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { Columns, Donut, Line } from '../../ui/charts'
import { stagger } from '../../ui/reveal'
import { useFilter } from '../../ui/useFilter'
import { StatusTag } from '../../ui/ui'
import { idrShort, num, timeOf } from './format'
import { Card, Kpis, PageTitle } from './kit'

const RANGES = ['4W', '8W'] as const
const SERIES = ['Total', 'Tickets', 'Merch', 'Membership'] as const
type Series = (typeof SERIES)[number]
const pickSeries = (w: Week, s: Series) => (s === 'Total' ? weekTotal(w) : s === 'Tickets' ? w.tickets : s === 'Merch' ? w.merch : w.members)
const sum = (ws: Week[], f: (w: Week) => number) => ws.reduce((s, w) => s + f(w), 0)
const pct = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : undefined)

// Average prices turn revenue into unit estimates until the API reports units.
const AVG_TICKET = 480_000
const AVG_ORDER = 520_000

function Range({ value, onChange }: { value: string; onChange: (v: (typeof RANGES)[number] | 'All') => void }) {
  return (
    <div role="group" aria-label="Date range" className="flex border border-line-strong">
      {(['4W', '8W', 'All'] as const).map((r) => (
        <button key={r} type="button" aria-pressed={value === r} onClick={() => onChange(r)} className={`h-9 px-3 text-[11px] uppercase tracking-[0.15em] transition-colors ${value === r ? 'bg-fg text-void' : 'text-muted hover:text-fg'}`}>
          {r === 'All' ? '12W' : r}
        </button>
      ))}
    </div>
  )
}

function Feed() {
  const [items, setItems] = useState(() => FEED_POOL.slice(0, 5).map((text, i) => ({ id: i, text, mins: (i + 1) * 4 })))
  const next = useRef(5)
  useEffect(() => {
    const t = setInterval(() => {
      const id = next.current++
      setItems((list) => [{ id, text: FEED_POOL[id % FEED_POOL.length], mins: 0 }, ...list.map((x) => ({ ...x, mins: x.mins + 1 }))].slice(0, 7))
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
            <span className="shrink-0 text-[10px] text-subtle tabular">{it.mins ? `${it.mins}m` : 'now'}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}

const cardLink = 'text-[10px] uppercase tracking-[0.2em] text-muted underline-offset-4 hover:text-fg hover:underline'

export default function Overview() {
  const [range, setRange] = useFilter<(typeof RANGES)[number]>('range')
  const [series, setSeries] = useState<Series>('Total')
  const n = range === '4W' ? 4 : range === '8W' ? 8 : 12
  const weeks = WEEKS.slice(-n)
  const prev = n < 12 ? WEEKS.slice(-2 * n, -n) : []
  const [sel, setSel] = useState(11)
  const selIndex = Math.min(sel, n - 1)
  const selected = weeks[selIndex]
  const members = MEMBERS.slice(-n)

  const revenue = sum(weeks, weekTotal)
  const tickets = Math.round(sum(weeks, (w) => w.tickets) / AVG_TICKET)
  const orders = Math.round(sum(weeks, (w) => w.merch) / AVG_ORDER)
  const joined = members[members.length - 1] - (MEMBERS[MEMBERS.length - n - 1] ?? 380)
  const vs = prev.length ? 'vs prior period' : `${n} weeks`

  const units = ORDERS.filter((o) => o.status !== 'Refunded')
    .flatMap((o) => o.items)
    .reduce<Record<string, number>>((acc, it) => ({ ...acc, [it.itemId]: (acc[it.itemId] ?? 0) + 1 }), {})
  const topMerch = Object.entries(units)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const topMax = topMerch[0]?.[1] ?? 1

  return (
    <>
      <PageTitle
        title="Overview"
        sub={`Sales, members and activity over the last ${n} weeks.`}
        actions={
          <Range
            value={range}
            onChange={(v) => {
              setRange(v)
              setSel(11)
            }}
          />
        }
      />

      <Kpis
        items={[
          { label: 'Revenue', value: revenue, format: idrShort, delta: pct(revenue, sum(prev, weekTotal)), note: vs, trend: weeks.map(weekTotal) },
          { label: 'Tickets sold (est.)', value: tickets, format: num, delta: pct(tickets, Math.round(sum(prev, (w) => w.tickets) / AVG_TICKET)), note: vs, trend: weeks.map((w) => w.tickets) },
          { label: 'New RAW members', value: joined, format: num, note: `${num(MEMBERS[MEMBERS.length - 1])} total`, trend: members },
          { label: 'Merch orders (est.)', value: orders, format: num, delta: pct(orders, Math.round(sum(prev, (w) => w.merch) / AVG_ORDER)), note: vs, trend: weeks.map((w) => w.merch) },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Weekly revenue"
          kicker={`Last ${n} weeks`}
          className="xl:col-span-2"
          action={
            <div role="tablist" aria-label="Revenue series" className="flex gap-4">
              {SERIES.map((s) => (
                <button key={s} type="button" role="tab" aria-selected={series === s} onClick={() => setSeries(s)} className={`border-b-2 pb-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${series === s ? 'border-signal text-fg' : 'border-transparent text-muted hover:text-fg'}`}>
                  {s}
                </button>
              ))}
            </div>
          }
        >
          <div data-reveal className="grid gap-6 md:grid-cols-[1fr_12rem]">
            <Columns key={`${n}-${series}`} data={weeks.map((w) => ({ label: w.label, value: pickSeries(w, series) }))} selected={selIndex} onSelect={setSel} format={idrShort} />
            <dl key={selected.label} className="animate-rise space-y-4 border-t border-line pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">Week of {selected.label}</dt>
                <dd className="mt-1 font-display text-3xl tabular">{idrShort(weekTotal(selected))}</dd>
              </div>
              {(['Tickets', 'Merch', 'Membership'] as const).map((k) => {
                const v = pickSeries(selected, k)
                return (
                  <div key={k}>
                    <div className="flex justify-between text-[11px] uppercase tracking-wider">
                      <dt className="text-muted">{k}</dt>
                      <dd className="tabular">{idrShort(v)}</dd>
                    </div>
                    <div className="mt-1.5 h-1 bg-raised">
                      <div className={`h-full transition-[width] duration-700 ${series === k ? 'bg-signal' : 'bg-fg'}`} style={{ width: `${(v / weekTotal(selected)) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </dl>
          </div>
        </Card>
        <Card title="Revenue mix" kicker="Last 12 weeks">
          <Donut slices={MIX} format={idrShort} center="Total" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="Sell-through" kicker="Upcoming events" action={<Link to="/admin/events" className={cardLink}>Events</Link>}>
          <ul className="space-y-5">
            {SELL_THROUGH.map((s, i) => {
              const v = s.sold / s.capacity
              return (
                <li key={s.eventId}>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-xs">
                    <span className="truncate font-bold uppercase">{eventById(s.eventId)?.title}</span>
                    <span className="shrink-0 tabular text-muted">{Math.round(v * 100)}%</span>
                  </div>
                  <div className="h-2 bg-raised">
                    <div style={{ '--v': v, '--d': `${i * 150}ms` } as CSSProperties} className={`fill h-full ${v > 0.8 ? 'bg-signal' : 'bg-fg'}`} />
                  </div>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-subtle tabular">
                    {s.label} {num(s.sold)} / {num(s.capacity)}
                  </p>
                </li>
              )
            })}
          </ul>
        </Card>
        <Card title="RAW members" kicker="Cumulative" action={<Link to="/admin/members" className={cardLink}>Members</Link>}>
          <Line key={n} values={members} labels={weeks.map((w) => w.label)} />
        </Card>
        <Card title="Top merch" kicker="Units in recent orders" className="lg:col-span-2 xl:col-span-1" action={<Link to="/admin/merch" className={cardLink}>Merch</Link>}>
          <ol className="space-y-4">
            {topMerch.map(([id, count], i) => (
              <li key={id} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 gap-y-1.5 text-xs">
                <span className="row-span-2 font-display text-lg text-subtle tabular">{i + 1}</span>
                <span className="truncate font-bold uppercase">{MERCH.find((m) => m.id === id)?.name}</span>
                <span className="tabular text-muted">{count}</span>
                <span className="col-span-2 h-1 bg-raised">
                  <span style={{ '--v': count / topMax, '--d': `${i * 120}ms` } as CSSProperties} className="fill block h-full bg-fg" />
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          title="Latest bookings"
          kicker="Most recent"
          className="xl:col-span-2"
          action={
            <Link to="/admin/bookings" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-fg">
              All bookings <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {BOOKINGS.slice(0, 6).map((b, i) => (
              <li key={b.code} data-reveal style={stagger(i, 50)}>
                <Link to={`/admin/bookings?q=${b.code}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 text-xs hover:bg-raised sm:grid-cols-[7rem_1fr_9rem_6rem_7rem] sm:px-2">
                  <span className="font-mono font-bold">{b.code}</span>
                  <span className="truncate uppercase">{b.name}</span>
                  <span className="hidden truncate text-muted sm:block">{eventById(b.eventId)?.title}</span>
                  <span className="text-right tabular sm:text-left">{b.total ? formatIDR(b.total) : 'Free'}</span>
                  <span className="text-right text-[10px] text-subtle tabular">{timeOf(b.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Feed />
      </div>
    </>
  )
}
