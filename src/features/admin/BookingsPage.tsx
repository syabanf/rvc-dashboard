import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStore } from '../../app/store'
import { BOOKING_STATUSES, BOOKINGS, type AdminBooking, type BookingStatus } from '../../data/admin'
import { EVENTS, eventById } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, inputCls, StatusTag } from '../../ui/ui'
import { idrShort, num, timeOf } from './format'
import { Card, ClearFilters, DataTable, Drawer, Facts, Kpis, PageTitle, type Column } from './kit'

const tone = (s: BookingStatus) => (s === 'Paid' ? 'solid' : s === 'Pending' ? 'live' : 'muted')

export default function BookingsPage() {
  const { bookings, toast } = useStore()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useFilter<BookingStatus>('status')
  const [eventId, setEventId] = useFilter<string>('event')
  const q = params.get('q') ?? ''
  const [overrides, setOverrides] = useState<Record<string, BookingStatus>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [openCode, setOpenCode] = useState<string | null>(null)

  // Bookings made on this device through /rsvp show up first.
  const all = useMemo<AdminBooking[]>(
    () =>
      [
        ...bookings.map((b) => ({ code: b.code, name: b.name, eventId: b.eventId, tier: eventById(b.eventId)?.tiers.find((t) => t.id === b.tierId)?.name ?? '', qty: b.qty, total: b.total, status: 'Paid' as const, at: b.createdAt })),
        ...BOOKINGS,
      ].map((b) => ({ ...b, status: overrides[b.code] ?? b.status })),
    [bookings, overrides],
  )
  const byEvent = all.filter((b) => eventId === 'All' || b.eventId === eventId)
  const rows = byEvent.filter((b) => (status === 'All' || b.status === status) && (!q || `${b.name} ${b.code}`.toLowerCase().includes(q.toLowerCase())))
  const open = all.find((b) => b.code === openCode)

  const setQ = (v: string) =>
    setParams(
      (p) => {
        if (v) p.set('q', v)
        else p.delete('q')
        return p
      },
      { replace: true },
    )
  const refund = (codes: string[]) => {
    const eligible = codes.filter((c) => {
      const b = all.find((x) => x.code === c)
      return b && b.status !== 'Refunded' && b.total > 0
    })
    if (!eligible.length) return toast('Nothing to refund', 'Free or already refunded bookings were skipped.')
    setOverrides((o) => ({ ...o, ...Object.fromEntries(eligible.map((c) => [c, 'Refunded' as const])) }))
    setSelected(new Set())
    toast(`${eligible.length} marked as refunded`, 'Payment provider refunds start once it is connected.')
  }
  const resend = (codes: string[]) => {
    toast(`${codes.length} ticket${codes.length > 1 ? 's' : ''} queued to resend`, 'Email delivery starts with the backend.')
    setSelected(new Set())
  }

  const paid = all.filter((b) => b.status === 'Paid')
  const pending = all.filter((b) => b.status === 'Pending')

  const columns: Column<AdminBooking>[] = [
    { key: 'code', header: 'Code', cell: (b) => <span className="font-mono font-bold">{b.code}</span>, csv: (b) => b.code },
    { key: 'name', header: 'Guest', cell: (b) => <span className="uppercase">{b.name}</span>, csv: (b) => b.name },
    { key: 'event', header: 'Event', cell: (b) => <span className="block max-w-[14rem] truncate text-muted">{eventById(b.eventId)?.title}</span>, csv: (b) => eventById(b.eventId)?.title ?? '' },
    { key: 'tier', header: 'Ticket', cell: (b) => <span className="text-muted">{b.qty} × {b.tier}</span>, csv: (b) => `${b.qty} x ${b.tier}` },
    { key: 'total', header: 'Total', className: 'text-right', cell: (b) => <span className="tabular">{b.total ? formatIDR(b.total) : 'Free'}</span>, csv: (b) => b.total },
    { key: 'status', header: 'Status', cell: (b) => <StatusTag tone={tone(b.status)}>{b.status}</StatusTag>, csv: (b) => b.status },
    { key: 'at', header: 'Booked', cell: (b) => <span className="whitespace-nowrap text-muted tabular">{timeOf(b.at)}</span>, csv: (b) => b.at },
  ]

  return (
    <>
      <PageTitle title="Bookings" sub="Every ticket and waitlist booking across upcoming events." />
      <Kpis
        items={[
          { label: 'Bookings', value: all.length, format: num, note: 'in this list' },
          { label: 'Paid revenue', value: paid.reduce((s, b) => s + b.total, 0), format: idrShort, note: `${paid.length} paid` },
          { label: 'Pending value', value: pending.reduce((s, b) => s + b.total, 0), format: idrShort, note: `${pending.length} awaiting payment` },
          { label: 'Refund rate', value: Math.round((all.filter((b) => b.status === 'Refunded').length / all.length) * 100), format: (n) => `${n}%`, note: 'of all bookings' },
        ]}
      />
      <Card title="All bookings" kicker={`${rows.length} shown`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 basis-full xl:flex-1 xl:basis-auto">
            <Chips label="Filter by status" options={BOOKING_STATUSES} value={status} onChange={setStatus} counts={countBy(byEvent, (b) => b.status)} />
          </div>
          <label className="relative w-full sm:w-60">
            <span className="sr-only">Search name or code</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or code" className={`${inputCls} h-10 pl-9`} />
          </label>
          <select aria-label="Filter by event" value={eventId} onChange={(e) => setEventId(e.target.value)} className={`${inputCls} h-10 w-full sm:w-60`}>
            <option value="All">All events</option>
            {EVENTS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {selected.size > 0 && (
          <div className="animate-rise my-4 flex flex-wrap items-center justify-between gap-3 border border-fg bg-raised px-4 py-3">
            <span className="text-xs uppercase tracking-[0.15em]">{selected.size} selected</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={btn('solid', 'h-9')} onClick={() => resend([...selected])}>
                Resend tickets
              </button>
              <button type="button" className={btn('line', 'h-9')} onClick={() => refund([...selected])}>
                Mark refunded
              </button>
              <button type="button" className={btn('ghost', 'h-9')} onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          </div>
        )}

        <DataTable
          key={`${status}-${eventId}-${q}`}
          rows={rows}
          columns={columns}
          rowKey={(b) => b.code}
          onOpen={(b) => setOpenCode(b.code)}
          selected={selected}
          onSelect={setSelected}
          exportName="rvc-bookings"
          empty={<ClearFilters onClear={() => setParams({}, { replace: true })} />}
        />
      </Card>

      {open && (
        <Drawer
          title={open.code}
          onClose={() => setOpenCode(null)}
          footer={
            <>
              <button type="button" className={btn('solid')} onClick={() => resend([open.code])}>
                Resend ticket
              </button>
              <button type="button" disabled={open.status === 'Refunded' || !open.total} className={btn('line')} onClick={() => refund([open.code])}>
                Mark as refunded
              </button>
            </>
          }
        >
          <Facts
            items={[
              ['Guest', open.name],
              ['Status', <StatusTag key="status" tone={tone(open.status)}>{open.status}</StatusTag>],
              ['Event', eventById(open.eventId)?.title],
              ['Ticket', `${open.qty} × ${open.tier}`],
              ['Total', open.total ? formatIDR(open.total) : 'Free'],
              ['Booked', timeOf(open.at)],
            ]}
          />
        </Drawer>
      )}
    </>
  )
}
