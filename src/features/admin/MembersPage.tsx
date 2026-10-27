import { Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStore } from '../../app/store'
import { MEMBER_LIST, MEMBERS, PLAN_SPLIT, WEEKS, type Member } from '../../data/admin'
import { PLANS } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { Donut, Line } from '../../ui/charts'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, inputCls, StatusTag } from '../../ui/ui'
import { idrShort, num, timeOf } from './format'
import { Card, ClearFilters, DataTable, Drawer, Facts, Kpis, PageTitle, type Column } from './kit'

const PLAN_NAMES = ['RAW Circle', 'RAW Core'] as const
const circle = PLAN_SPLIT[0].value
const core = PLAN_SPLIT[1].value
// Monthly recurring: Circle bills monthly, Core yearly spread over twelve months.
const MRR = circle * PLANS[0].price + Math.round((core * PLANS[1].price) / 12)
const CHURN = 3.1

export default function MembersPage() {
  const { toast } = useStore()
  const [params, setParams] = useSearchParams()
  const [plan, setPlan] = useFilter<(typeof PLAN_NAMES)[number]>('plan')
  const q = params.get('q') ?? ''
  const [openId, setOpenId] = useState<string | null>(null)
  const rows = MEMBER_LIST.filter((m) => (plan === 'All' || m.plan === plan) && (!q || `${m.name} ${m.id} ${m.city}`.toLowerCase().includes(q.toLowerCase())))
  const open = MEMBER_LIST.find((m) => m.id === openId)

  const setQ = (v: string) =>
    setParams(
      (p) => {
        if (v) p.set('q', v)
        else p.delete('q')
        return p
      },
      { replace: true },
    )

  const columns: Column<Member>[] = [
    { key: 'id', header: 'Member', cell: (m) => <span className="font-mono font-bold">{m.id}</span>, csv: (m) => m.id },
    { key: 'name', header: 'Name', cell: (m) => <span className="uppercase">{m.name}</span>, csv: (m) => m.name },
    { key: 'plan', header: 'Plan', cell: (m) => <StatusTag tone={m.plan === 'RAW Core' ? 'solid' : 'muted'}>{m.plan}</StatusTag>, csv: (m) => m.plan },
    { key: 'city', header: 'City', cell: (m) => <span className="text-muted">{m.city}</span>, csv: (m) => m.city },
    { key: 'spend', header: 'Lifetime spend', className: 'text-right', cell: (m) => <span className="tabular">{formatIDR(m.spend)}</span>, csv: (m) => m.spend },
    { key: 'status', header: 'Status', cell: (m) => <span className={m.status === 'Active' ? 'text-fg' : 'text-signal'}>{m.status}</span>, csv: (m) => m.status },
    { key: 'joined', header: 'Joined', cell: (m) => <span className="whitespace-nowrap text-muted tabular">{timeOf(m.joined)}</span>, csv: (m) => m.joined },
  ]

  return (
    <>
      <PageTitle title="Members" sub="RAW Circle and RAW Core members, growth and revenue." />
      <Kpis
        items={[
          { label: 'Members', value: MEMBERS[MEMBERS.length - 1], format: num, trend: MEMBERS, note: 'all plans' },
          { label: 'New this week', value: MEMBERS[MEMBERS.length - 1] - MEMBERS[MEMBERS.length - 2], format: num, delta: Math.round(((MEMBERS[11] - MEMBERS[10]) / (MEMBERS[10] - MEMBERS[9]) - 1) * 100), note: 'vs last week' },
          { label: 'Monthly recurring', value: MRR, format: idrShort, note: 'Core spread monthly' },
          { label: 'Churn', value: Math.round(CHURN * 10), format: (n) => `${(n / 10).toFixed(1)}%`, note: 'last 30 days' },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Growth" kicker="Cumulative, 12 weeks" className="xl:col-span-2">
          <Line values={MEMBERS} labels={WEEKS.map((w) => w.label)} />
        </Card>
        <Card title="Plan split" kicker="All members">
          <Donut slices={PLAN_SPLIT} format={num} center="Members" />
        </Card>
      </div>
      <Card title="Directory" kicker={`${rows.length} shown of latest ${MEMBER_LIST.length}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 basis-full lg:flex-1 lg:basis-auto">
            <Chips label="Filter by plan" options={PLAN_NAMES} value={plan} onChange={setPlan} counts={countBy(MEMBER_LIST, (m) => m.plan)} />
          </div>
          <label className="relative w-full sm:w-60">
            <span className="sr-only">Search name, ID or city</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, ID or city" className={`${inputCls} h-10 pl-9`} />
          </label>
        </div>
        <DataTable key={`${plan}-${q}`} rows={rows} columns={columns} rowKey={(m) => m.id} onOpen={(m) => setOpenId(m.id)} exportName="rvc-members" empty={<ClearFilters onClear={() => setParams({}, { replace: true })} />} />
      </Card>

      {open && (
        <Drawer
          title={open.id}
          onClose={() => setOpenId(null)}
          footer={
            <>
              <button type="button" className={btn('solid')} onClick={() => toast('Presale code queued', `For ${open.name}. Sending starts with the mailing backend.`)}>
                Send presale code
              </button>
              <button type="button" className={btn('line')} onClick={() => toast('Guest list draw entry added', `${open.name} is in the next draw on this screen only.`)}>
                Add to guest list draw
              </button>
            </>
          }
        >
          <Facts
            items={[
              ['Name', open.name],
              ['Plan', open.plan],
              ['City', open.city],
              ['Status', open.status],
              ['Lifetime spend', formatIDR(open.spend)],
              ['Joined', timeOf(open.joined)],
            ]}
          />
        </Drawer>
      )}
    </>
  )
}
