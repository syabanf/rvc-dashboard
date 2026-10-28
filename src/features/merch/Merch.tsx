import { ArrowDownRight, Asterisk } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { formatIDR } from '../../domain/rules'
import { MERCH_CATEGORIES, type MerchItem } from '../../domain/types'
import { Media } from '../../ui/Media'
import { stagger } from '../../ui/reveal'
import { BracketThumb, itemCode, Specs } from '../../ui/scene'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty } from '../../ui/ui'

const STOCK = { in: 'In stock', low: 'Low stock', out: 'Sold out' }

/** One numbered product row. Click opens it in place with a big image, sizes and Add to bag. */
function Row({ item, index, open, onToggle }: { item: MerchItem; index: number; open: boolean; onToggle: () => void }) {
  const { member, addToCart, setCartOpen, toast } = useStore()
  const [size, setSize] = useState(item.sizes.length === 1 ? item.sizes[0] : '')
  const locked = item.membersOnly && !member
  const soldOut = item.stock === 'out'
  const ink = index % 2 === 1

  const add = () => {
    if (!size) return toast('Pick a size first')
    addToCart(item.id, size)
    toast('Added to bag', `${item.name}, ${size}`)
    setCartOpen(true)
  }

  return (
    <li data-reveal style={stagger(index, 50)} className={`border-b border-fg ${ink ? 'bg-fg text-void' : 'bg-void text-fg'}`}>
      <button type="button" aria-expanded={open} onClick={onToggle} className="group grid w-full grid-cols-[2rem_4rem_1fr_auto] items-center gap-3 px-3 py-3 text-left md:grid-cols-[3rem_5.5rem_minmax(0,1.3fr)_minmax(0,1fr)_9rem_2.5rem] md:gap-5 md:px-5">
        <span className="self-start pt-1 text-sm tabular md:text-lg">{String(index + 1).padStart(2, '0')}</span>
        <BracketThumb className="size-16 md:size-[5.5rem]">
          <span className={`block size-full transition-transform duration-500 group-hover:scale-110 ${locked ? 'blur-sm' : ''} ${soldOut ? 'opacity-40' : ''}`}>
            <Media image={item.image} seed={item.id} scene={item.scene} label={item.name} ripple={false} />
          </span>
        </BracketThumb>
        <span className="min-w-0">
          <span className="flex items-start gap-2 font-display text-xl uppercase leading-none transition-colors group-hover:text-signal md:text-4xl">
            <span className="min-w-0 break-words">{item.name}</span>
            <sup className="mt-1 shrink-0 text-[10px] tracking-[0.1em] md:text-xs">{itemCode(item)}</sup>
          </span>
          <span className="mt-2 block text-xs tabular md:hidden">{formatIDR(item.price)}</span>
        </span>
        <Specs
          className="hidden md:flex"
          specs={[
            ['Style', item.category],
            ['Size', item.sizes.length > 1 ? `${item.sizes[0]}–${item.sizes[item.sizes.length - 1]}` : item.sizes[0]],
            ['Stock', item.membersOnly ? 'RAW only' : STOCK[item.stock]],
          ]}
        />
        <span className="hidden text-right text-lg tabular md:block">{formatIDR(item.price)}</span>
        <ArrowDownRight className={`size-6 justify-self-end transition-transform duration-300 md:size-8 ${open ? '-rotate-90' : 'group-hover:-rotate-45'}`} aria-hidden />
      </button>

      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid gap-6 px-3 pb-6 pt-2 md:grid-cols-[minmax(0,22rem)_1fr] md:px-5 md:pl-[calc(3rem+2.5rem)]">
            <div className="relative aspect-square overflow-hidden bg-panel">
              <div className={`size-full ${locked ? 'scale-110 blur-md' : ''}`}>
                <Media image={item.image} seed={item.id} scene={item.scene} label={item.name} />
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <Specs className="md:hidden" specs={[['Style', item.category], ['Stock', item.membersOnly ? 'RAW only' : STOCK[item.stock]]]} />
                <p className="max-w-md text-sm uppercase leading-snug opacity-80">
                  {item.name} {itemCode(item)}. Made for one show and gone after it. No restocks.
                </p>
              </div>
              {locked ? (
                <Link to="/raw" className={btn('line', 'w-fit rounded-full border-current')}>
                  RAW members only, join to unlock
                </Link>
              ) : (
                <div className="space-y-4">
                  <div role="radiogroup" aria-label={`Size for ${item.name}`} className="flex flex-wrap gap-1.5">
                    {item.sizes.map((s) => (
                      <button key={s} type="button" role="radio" aria-checked={size === s} disabled={soldOut} onClick={() => setSize(s)} className={`h-9 min-w-10 rounded-full border px-3 text-[11px] uppercase transition-colors disabled:opacity-40 ${size === s ? 'border-signal bg-signal text-fg' : 'border-current opacity-70 hover:opacity-100'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button type="button" disabled={soldOut} onClick={add} className="inline-flex h-11 items-center gap-2 rounded-full bg-signal px-6 text-sm font-bold uppercase text-fg transition-transform hover:scale-105 disabled:opacity-40">
                    {soldOut ? 'Sold out' : 'Add to bag'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Merch() {
  const { merch: MERCH } = useContent()
  const [cat, setCat] = useFilter<(typeof MERCH_CATEGORIES)[number]>('category')
  const [open, setOpen] = useState<string | null>(null)
  const list = MERCH.filter((m) => cat === 'All' || m.category === cat)
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <header className="flex items-end justify-between gap-6 pb-4 pt-14 md:pt-20">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">03 / Drops</p>
          <h1 className="mt-2 font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.85] tracking-[-0.04em]">Exclusive merch</h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em]">Originals from Raw Vision Collective</p>
        </div>
        <p className="flex shrink-0 items-center gap-2 font-display text-2xl tabular md:text-4xl">
          [{String(list.length).padStart(2, '0')}]
          <Asterisk className="size-8 animate-[spin-slow_8s_linear_infinite] md:size-12" aria-hidden />
        </p>
      </header>
      <Chips label="Filter by category" options={MERCH_CATEGORIES} value={cat} onChange={setCat} counts={countBy(MERCH, (m) => m.category)} />
      {list.length === 0 ? (
        <Empty title="Nothing in this category" action={<button type="button" className={btn('line')} onClick={() => setCat('All')}>Clear filter</button>} />
      ) : (
        <ul className="border-t border-fg">
          {list.map((m, i) => (
            <Row key={m.id} item={m} index={i} open={open === m.id} onToggle={() => setOpen(open === m.id ? null : m.id)} />
          ))}
        </ul>
      )}
    </div>
  )
}
