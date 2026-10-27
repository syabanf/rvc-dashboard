import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useStore } from '../../app/store'
import { BOOKINGS, PAST_RESULTS, SELL_THROUGH } from '../../data/admin'
import { EVENTS, eventById, SHOWS } from '../../data/catalog'
import { countdown, formatDate, formatIDR } from '../../domain/rules'
import type { PastShow, UpcomingEvent } from '../../domain/types'
import { btn, StatusTag } from '../../ui/ui'
import { idrShort, num } from './format'
import { Card, DataTable, Drawer, Facts, Kpis, PageTitle, type Column } from './kit'

const sellThrough = (id: string) => SELL_THROUGH.find((s) => s.eventId === id)!
// Gross for upcoming events: paid ticket mix from bookings applied to units sold.
const avgPrice = (e: UpcomingEvent) => {
  const paid = BOOKINGS.filter((b) => b.eventId === e.id && b.total > 0)
  return paid.length ? paid.reduce((s, b) => s + b.total, 0) / paid.reduce((s, b) => s + b.qty, 0) : 0
}
const gross = (e: UpcomingEvent) => Math.round(avgPrice(e) * sellThrough(e.id).sold)
const STATUS = { open: ['On sale', 'live'], presale: ['Presale', 'solid'], waitlist: ['Waitlist', 'muted'] } as const

function Bar({ v }: { v: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-24 bg-raised">
        <span style={{ '--v': v } as CSSProperties} className={`fill block h-full ${v > 0.8 ? 'bg-signal' : 'bg-fg'}`} />
      </span>
      <span className="tabular text-muted">{Math.round(v * 100)}%</span>
    </span>
  )
}

export default function EventsPage() {
  const { toast } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = openId ? eventById(openId) : undefined

  const upcoming: Column<UpcomingEvent>[] = [
    { key: 'title', header: 'Event', cell: (e) => <span className="font-bold uppercase">{e.title}</span>, csv: (e) => e.title },
    { key: 'date', header: 'Date', cell: (e) => <span className="whitespace-nowrap tabular text-muted">{formatDate(e.startsAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span>, csv: (e) => e.startsAt },
    { key: 'city', header: 'City', cell: (e) => <span className="text-muted">{e.city}</span>, csv: (e) => e.city },
    { key: 'sold', header: 'Sold / cap', cell: (e) => <span className="tabular">{num(sellThrough(e.id).sold)} / {num(sellThrough(e.id).capacity)}</span>, csv: (e) => sellThrough(e.id).sold },
    { key: 'through', header: 'Sell-through', cell: (e) => <Bar v={sellThrough(e.id).sold / sellThrough(e.id).capacity} /> },
    { key: 'gross', header: 'Gross', className: 'text-right', cell: (e) => <span className="tabular">{gross(e) ? idrShort(gross(e)) : 'Free'}</span>, csv: (e) => gross(e) },
    { key: 'status', header: 'Status', cell: (e) => <StatusTag tone={STATUS[e.status][1]}>{STATUS[e.status][0]}</StatusTag>, csv: (e) => e.status },
  ]
  const past: Column<PastShow>[] = [
    { key: 'title', header: 'Show', cell: (s) => <span className="font-bold uppercase">{s.title}</span>, csv: (s) => s.title },
    { key: 'date', header: 'Date', cell: (s) => <span className="whitespace-nowrap tabular text-muted">{formatDate(s.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span>, csv: (s) => s.date },
    { key: 'venue', header: 'Venue', cell: (s) => <span className="text-muted">{s.venue}, {s.city}</span>, csv: (s) => s.venue },
    { key: 'att', header: 'Attendance', className: 'text-right', cell: (s) => <span className="tabular">{num(PAST_RESULTS[s.id].attendance)}</span>, csv: (s) => PAST_RESULTS[s.id].attendance },
    { key: 'rev', header: 'Revenue', className: 'text-right', cell: (s) => <span className="tabular">{idrShort(PAST_RESULTS[s.id].revenue)}</span>, csv: (s) => PAST_RESULTS[s.id].revenue },
    { key: 'head', header: 'Per head', className: 'text-right', cell: (s) => <span className="tabular text-muted">{formatIDR(Math.round(PAST_RESULTS[s.id].revenue / PAST_RESULTS[s.id].attendance))}</span> },
  ]

  const tierSales = (e: UpcomingEvent) =>
    e.tiers.map((t) => ({ tier: t, units: BOOKINGS.filter((b) => b.eventId === e.id && b.tier === t.name).reduce((s, b) => s + b.qty, 0) }))

  return (
    <>
      <PageTitle
        title="Events"
        sub="Sales for the next four dates and results from every past show."
        actions={
          <Link to="/events" className={btn('line', 'h-9')}>
            View on site
          </Link>
        }
      />
      <Kpis
        items={[
          { label: 'Upcoming events', value: EVENTS.length, format: num, note: `next in ${countdown(EVENTS[0].startsAt).days} days` },
          { label: 'Tickets sold', value: SELL_THROUGH.filter((s) => s.label !== 'Waitlist').reduce((a, s) => a + s.sold, 0), format: num, note: 'on-sale and presale' },
          { label: 'Waitlist', value: SELL_THROUGH.filter((s) => s.label === 'Waitlist').reduce((a, s) => a + s.sold, 0), format: num, note: 'NYE and Singapore' },
          { label: 'Upcoming gross', value: EVENTS.reduce((a, e) => a + gross(e), 0), format: idrShort, note: 'estimated' },
        ]}
      />
      <Card title="Upcoming" kicker="Click a row for tier sales">
        <DataTable rows={EVENTS} columns={upcoming} rowKey={(e) => e.id} onOpen={(e) => setOpenId(e.id)} exportName="rvc-upcoming-events" empty={null} />
      </Card>
      <Card title="Past shows" kicker="Results">
        <DataTable rows={SHOWS} columns={past} rowKey={(s) => s.id} exportName="rvc-past-shows" empty={null} />
      </Card>

      {open && (
        <Drawer
          title={open.title}
          onClose={() => setOpenId(null)}
          footer={
            <>
              <Link to={`/admin/bookings?event=${open.id}`} className={btn('solid')}>
                Open bookings
              </Link>
              <button type="button" className={btn('line')} onClick={() => toast('Announcement drafted', `${open.title}. Sending opens with the mailing backend.`)}>
                Draft announcement
              </button>
            </>
          }
        >
          <Facts
            items={[
              ['Date', formatDate(open.startsAt)],
              ['Venue', `${open.venue}, ${open.city}`],
              ['Sold', `${num(sellThrough(open.id).sold)} / ${num(sellThrough(open.id).capacity)}`],
              ['Gross', gross(open) ? idrShort(gross(open)) : 'Free'],
            ]}
          />
          <p className="mb-4 mt-8 text-[10px] uppercase tracking-[0.25em] text-muted">Tier sales in recent bookings</p>
          <ul data-reveal className="space-y-4">
            {(() => {
              const tiers = tierSales(open)
              const max = Math.max(1, ...tiers.map((t) => t.units))
              return tiers.map(({ tier, units }, i) => (
                <li key={tier.id} className="text-xs">
                  <div className="mb-1.5 flex justify-between gap-3">
                    <span className="uppercase">
                      {tier.name} {tier.soldOut && <span className="text-signal">· sold out</span>}
                    </span>
                    <span className="tabular text-muted">{units} units</span>
                  </div>
                  <div className="h-2 bg-raised">
                    <div style={{ '--v': units / max, '--d': `${i * 120}ms` } as CSSProperties} className="fill h-full bg-fg" />
                  </div>
                </li>
              ))
            })()}
          </ul>
        </Drawer>
      )}
    </>
  )
}
