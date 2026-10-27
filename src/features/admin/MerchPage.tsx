import { Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStore } from '../../app/store'
import { ORDER_STATUSES, ORDERS, SHIPPING_FEE, STOCK, type Order, type OrderStatus } from '../../data/admin'
import { MERCH } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { Meter } from '../../ui/charts'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, inputCls, StatusTag } from '../../ui/ui'
import { idrShort, num, timeOf } from './format'
import { Card, ClearFilters, DataTable, Drawer, Facts, Kpis, PageTitle, type Column } from './kit'

const item = (id: string) => MERCH.find((m) => m.id === id)!
const tone = (s: OrderStatus) => (s === 'Processing' ? 'live' : s === 'Delivered' ? 'solid' : 'muted')
const RESTOCK = 50

type StockRow = (typeof STOCK)[number]

export default function MerchPage() {
  const { toast } = useStore()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useFilter<OrderStatus>('status')
  const q = params.get('q') ?? ''
  const [stock, setStock] = useState(STOCK)
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({})
  const [openCode, setOpenCode] = useState<string | null>(null)

  const orders = ORDERS.map((o) => ({ ...o, status: overrides[o.code] ?? o.status }))
  const rows = orders.filter((o) => (status === 'All' || o.status === status) && (!q || `${o.name} ${o.code}`.toLowerCase().includes(q.toLowerCase())))
  const open = orders.find((o) => o.code === openCode)
  const live = orders.filter((o) => o.status !== 'Refunded')
  const revenue = live.reduce((s, o) => s + o.total, 0)

  const setQ = (v: string) =>
    setParams(
      (p) => {
        if (v) p.set('q', v)
        else p.delete('q')
        return p
      },
      { replace: true },
    )
  const restock = (id: string) => {
    setStock((list) => list.map((s) => (s.itemId === id ? { ...s, left: s.left + RESTOCK, of: Math.max(s.of, s.left + RESTOCK) } : s)))
    toast(`Restocked ${item(id).name}`, `+${RESTOCK} units on this screen only. Inventory sync comes with the backend.`)
  }
  const ship = (code: string) => {
    setOverrides((o) => ({ ...o, [code]: 'Shipped' }))
    toast('Marked as shipped', `${code}. The customer email goes out once mailing is connected.`)
  }

  const stockCols: Column<StockRow>[] = [
    { key: 'name', header: 'Item', cell: (s) => <span className="font-bold uppercase">{item(s.itemId).name}</span>, csv: (s) => item(s.itemId).name },
    { key: 'cat', header: 'Category', cell: (s) => <span className="text-muted">{item(s.itemId).category}</span>, csv: (s) => item(s.itemId).category },
    { key: 'price', header: 'Price', cell: (s) => <span className="tabular">{formatIDR(item(s.itemId).price)}</span>, csv: (s) => item(s.itemId).price },
    { key: 'meter', header: 'Stock', cell: (s) => <Meter key={s.left} ratio={s.left / s.of} low={s.left / s.of < 0.1} /> },
    { key: 'left', header: 'Left', className: 'text-right', cell: (s) => <span className={`tabular ${s.left / s.of < 0.1 ? 'text-signal' : 'text-muted'}`}>{s.left ? `${s.left} / ${s.of}` : 'Sold out'}</span>, csv: (s) => s.left },
    {
      key: 'act',
      header: '',
      className: 'text-right',
      cell: (s) => (
        <button type="button" onClick={() => restock(s.itemId)} className={btn(s.left / s.of < 0.1 ? 'solid' : 'line', 'h-8 px-3 text-[10px]')}>
          +{RESTOCK}
        </button>
      ),
    },
  ]
  const orderCols: Column<Order>[] = [
    { key: 'code', header: 'Order', cell: (o) => <span className="font-mono font-bold">{o.code}</span>, csv: (o) => o.code },
    { key: 'name', header: 'Customer', cell: (o) => <span className="uppercase">{o.name}</span>, csv: (o) => o.name },
    { key: 'items', header: 'Items', cell: (o) => <span className="block max-w-[16rem] truncate text-muted">{o.items.map((i) => item(i.itemId).name).join(', ')}</span>, csv: (o) => o.items.map((i) => `${item(i.itemId).name} (${i.size})`).join('; ') },
    { key: 'city', header: 'City', cell: (o) => <span className="text-muted">{o.city}</span>, csv: (o) => o.city },
    { key: 'total', header: 'Total', className: 'text-right', cell: (o) => <span className="tabular">{formatIDR(o.total)}</span>, csv: (o) => o.total },
    { key: 'status', header: 'Status', cell: (o) => <StatusTag tone={tone(o.status)}>{o.status}</StatusTag>, csv: (o) => o.status },
    { key: 'at', header: 'Placed', cell: (o) => <span className="whitespace-nowrap text-muted tabular">{timeOf(o.at)}</span>, csv: (o) => o.at },
  ]

  return (
    <>
      <PageTitle title="Merch" sub="Stock levels for every drop and the order queue." />
      <Kpis
        items={[
          { label: 'Merch revenue', value: revenue, format: idrShort, note: `${live.length} orders` },
          { label: 'Avg order', value: Math.round(revenue / live.length), format: idrShort, note: `incl. ${formatIDR(SHIPPING_FEE)} shipping` },
          { label: 'To pack', value: orders.filter((o) => o.status === 'Processing').length, format: num, note: 'in Processing' },
          { label: 'Low stock items', value: stock.filter((s) => s.left / s.of < 0.1).length, format: num, note: 'under 10% left' },
        ]}
      />
      <Card title="Stock" kicker="Per item">
        <DataTable rows={stock} columns={stockCols} rowKey={(s) => s.itemId} exportName="rvc-stock" empty={null} />
      </Card>
      <Card title="Orders" kicker={`${rows.length} shown`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 basis-full xl:flex-1 xl:basis-auto">
            <Chips label="Filter by status" options={ORDER_STATUSES} value={status} onChange={setStatus} counts={countBy(orders, (o) => o.status)} />
          </div>
          <label className="relative w-full sm:w-60">
            <span className="sr-only">Search customer or order</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Customer or order" className={`${inputCls} h-10 pl-9`} />
          </label>
        </div>
        <DataTable key={`${status}-${q}`} rows={rows} columns={orderCols} rowKey={(o) => o.code} onOpen={(o) => setOpenCode(o.code)} exportName="rvc-orders" empty={<ClearFilters onClear={() => setParams({}, { replace: true })} />} />
      </Card>

      {open && (
        <Drawer
          title={open.code}
          onClose={() => setOpenCode(null)}
          footer={
            <button type="button" disabled={open.status !== 'Processing'} className={btn('solid')} onClick={() => ship(open.code)}>
              {open.status === 'Processing' ? 'Mark as shipped' : `Already ${open.status.toLowerCase()}`}
            </button>
          }
        >
          <Facts
            items={[
              ['Customer', open.name],
              ['Status', <StatusTag key="status" tone={tone(open.status)}>{open.status}</StatusTag>],
              ['City', open.city],
              ['Placed', timeOf(open.at)],
            ]}
          />
          <p className="mb-3 mt-8 text-[10px] uppercase tracking-[0.25em] text-muted">Items</p>
          <ul className="divide-y divide-line border-y border-line text-xs">
            {open.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3 py-3">
                <span className="uppercase">
                  {item(it.itemId).name} <span className="text-muted">· {it.size}</span>
                </span>
                <span className="tabular">{formatIDR(item(it.itemId).price)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3 text-muted">
              <span>Shipping</span>
              <span className="tabular">{formatIDR(SHIPPING_FEE)}</span>
            </li>
          </ul>
          <p className="mt-4 flex justify-between text-sm font-bold uppercase">
            <span>Total</span>
            <span className="tabular">{formatIDR(open.total)}</span>
          </p>
        </Drawer>
      )}
    </>
  )
}
