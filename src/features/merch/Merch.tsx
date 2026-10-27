import { useState } from 'react'
import { useStore } from '../../app/store'
import { MERCH } from '../../data/catalog'
import { formatIDR } from '../../domain/rules'
import { MERCH_CATEGORIES, type MerchItem } from '../../domain/types'
import { Frame } from '../../ui/Frame'
import { stagger } from '../../ui/reveal'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, MembersLock, PageHead, StatusTag } from '../../ui/ui'

function Product({ item, index }: { item: MerchItem; index: number }) {
  const { member, addToCart, setCartOpen, toast } = useStore()
  const [size, setSize] = useState(item.sizes.length === 1 ? item.sizes[0] : '')
  const locked = item.membersOnly && !member
  const soldOut = item.stock === 'out'

  const add = () => {
    if (!size) return toast('Pick a size first')
    addToCart(item.id, size)
    toast('Added to bag', `${item.name}, ${size}`)
    setCartOpen(true)
  }

  return (
    <li data-reveal style={stagger(index)} className="flex flex-col">
      <div className="group relative aspect-square overflow-hidden bg-panel">
        <div className={`absolute inset-0 transition-transform duration-700 ${locked ? 'scale-110 blur-sm' : 'group-hover:scale-105'} ${soldOut ? 'opacity-40' : ''}`}>
          <Frame seed={item.id} scene={item.scene} label={item.name} />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          {item.membersOnly && <StatusTag tone="solid">RAW only</StatusTag>}
          {item.stock === 'low' && <StatusTag tone="live">Low stock</StatusTag>}
          {soldOut && <StatusTag tone="muted">Sold out</StatusTag>}
        </div>
        {locked && <MembersLock />}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-bold uppercase leading-snug">{item.name}</h2>
        <p className="shrink-0 text-sm tabular">{formatIDR(item.price)}</p>
      </div>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{item.category}</p>
      {!locked && (
        <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
          <div role="radiogroup" aria-label={`Size for ${item.name}`} className="flex flex-wrap gap-1.5">
            {item.sizes.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} disabled={soldOut} onClick={() => setSize(s)} className={`h-9 min-w-10 border px-2.5 text-[11px] uppercase transition-colors disabled:opacity-40 ${size === s ? 'border-fg bg-fg text-void' : 'border-line-strong text-muted hover:border-fg hover:text-fg'}`}>
                {s}
              </button>
            ))}
          </div>
          <button type="button" disabled={soldOut} onClick={add} className={btn('line', 'w-full')}>
            {soldOut ? 'Sold out' : 'Add to bag'}
          </button>
        </div>
      )}
    </li>
  )
}

export default function Merch() {
  const [cat, setCat] = useFilter<(typeof MERCH_CATEGORIES)[number]>('category')
  const list = MERCH.filter((m) => cat === 'All' || m.category === cat)
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="03" kicker="Drops" title={'Exclusive\nMerch'}>
        Made for one show and gone after it. No restocks. RAW members get pieces that never reach this page.
      </PageHead>
      <Chips label="Filter by category" options={MERCH_CATEGORIES} value={cat} onChange={setCat} counts={countBy(MERCH, (m) => m.category)} />
      {list.length === 0 ? (
        <Empty title="Nothing in this category" action={<button type="button" className={btn('line')} onClick={() => setCat('All')}>Clear filter</button>} />
      ) : (
        <ul className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((m, i) => (
            <Product key={m.id} item={m} index={i} />
          ))}
        </ul>
      )}
    </div>
  )
}
