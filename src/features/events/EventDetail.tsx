import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useContent } from '../../app/content'
import { useStore } from '../../app/store'
import { formatDate, formatIDR } from '../../domain/rules'
import type { Tier, UpcomingEvent } from '../../domain/types'
import { Words } from '../../ui/fx'
import { Media } from '../../ui/Media'
import { CrossBands, LiveCountdown, Qr, Sticker } from '../../ui/scene'
import { btn, Empty } from '../../ui/ui'
import { STATUS } from './status'

/** Path for one segment of a half ring around the stage, angles in radians. */
function arc(r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${300 + r * Math.cos(a)} ${300 + r * Math.sin(a)}`
  return `M${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`
}

/** Half-arena seat map: the priciest tier sits closest to the stage. Pins above pick a ring. */
function ArenaMap({ tiers }: { tiers: Tier[] }) {
  const rings = [...tiers].sort((a, b) => b.price - a.price)
  const [hot, setHot] = useState(rings[0]?.id)
  const width = Math.min(70, 200 / rings.length)
  return (
    <div>
      <ul className="relative mb-10 flex justify-between gap-2 border-t border-dashed border-void/40 pt-0">
        {rings.map((t, i) => (
          <li key={t.id} style={{ animationDelay: `${i * 120}ms` }} className="animate-rise -mt-2 flex flex-col items-center gap-2">
            <button type="button" aria-pressed={hot === t.id} onClick={() => setHot(t.id)} onPointerEnter={() => setHot(t.id)} className="group flex flex-col items-center gap-2">
              <span className={`size-4 rounded-full border-2 border-signal transition-colors ${hot === t.id ? 'bg-signal' : 'bg-fg'}`} />
              <span className={`border px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.18em] transition-colors ${hot === t.id ? 'border-signal bg-signal text-fg' : 'border-void/40'} ${t.soldOut ? 'line-through opacity-50' : ''}`}>
                {t.name}
                <span className="block text-sm tracking-normal tabular">{t.price ? formatIDR(t.price) : 'Free'}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <svg viewBox="0 0 600 320" className="w-full" role="img" aria-label="Seat map. The stage sits at the centre with tiers in rings around it.">
        {rings.map((t, i) => {
          const r0 = 78 + i * (width + 10)
          return [0, 1, 2].map((s) => {
            const a0 = Math.PI + (s * Math.PI) / 3 + 0.03
            const a1 = Math.PI + ((s + 1) * Math.PI) / 3 - 0.03
            return (
              <path
                key={`${t.id}-${s}`}
                d={arc(r0, r0 + width, a0, a1)}
                onPointerEnter={() => setHot(t.id)}
                className={`cursor-pointer stroke-void/40 transition-[fill,opacity] duration-300 ${hot === t.id ? 'fill-signal' : 'fill-void/10 hover:fill-void/20'} ${t.soldOut ? 'opacity-40' : ''}`}
                style={{ animation: `fade-in 0.5s ease-out ${300 + i * 140 + s * 60}ms both` }}
              />
            )
          })
        })}
        <path d={arc(0, 66, Math.PI, Math.PI * 2)} className="fill-void" />
        <text x="300" y="282" textAnchor="middle" className="fill-fg text-[15px] font-bold uppercase tracking-[0.3em]">
          Stage
        </text>
      </svg>
      <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-void/70" aria-live="polite">
        {rings.find((t) => t.id === hot)?.note}
      </p>
    </div>
  )
}

function Hero({ event }: { event: UpcomingEvent }) {
  // Side stickers borrow archive frames so the three cut-outs differ.
  const frames = useContent().photos.filter((p) => p.image && !p.membersOnly)
  const pick = (n: number) => frames[(event.id.length * 3 + n) % frames.length]?.image
  return (
    <section className="relative overflow-hidden bg-fg text-void">
      <div aria-hidden className="strobe pointer-events-none absolute inset-0 z-20 bg-void" />
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-8">
        <Link to="/events" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-void/70 hover:text-void">
          <ArrowLeft className="size-4" /> All events
        </Link>
        <h1 className="mt-8 text-center font-display text-[clamp(2.4rem,8vw,7.5rem)] uppercase leading-[0.9] tracking-[-0.03em]">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-[0.25em]">
            {event.title.split(' ').map((w, i) => (
              <span key={i} className="animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
                {w}
              </span>
            ))}
          </span>
        </h1>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-void/70">
          {formatDate(event.startsAt, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} · {event.venue}
        </p>
        <div className="mx-auto mt-10 flex max-w-4xl items-end justify-center gap-[6%] pb-16 md:mt-14 md:pb-20">
          <Sticker image={pick(0)} seed={`${event.id}-a`} scene="crowd" shape={0} caption="No. 01" className="aspect-[3/4] w-[26%]" style={{ animationDelay: '200ms, 1600ms' }} />
          <Sticker image={event.image} seed={`${event.id}-b`} scene="stage" shape={1} caption="No. 02" className="aspect-[3/4] w-[32%]" style={{ animationDelay: '350ms, 1750ms' }} />
          <Sticker image={pick(5)} seed={`${event.id}-c`} scene="portrait" shape={2} caption="No. 03" className="aspect-square w-[24%]" style={{ animationDelay: '500ms, 1900ms' }} />
        </div>
      </div>
      <CrossBands className="-mb-3" items={[event.city, event.venue, formatDate(event.startsAt, { day: '2-digit', month: 'short' }), STATUS[event.status].tag]} />
    </section>
  )
}

function Ticket({ event }: { event: UpcomingEvent }) {
  const { member } = useStore()
  const s = STATUS[event.status]
  const needsMember = event.status === 'presale' && !member
  return (
    <section aria-labelledby="ticket-title" className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div data-reveal className="space-y-5">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-signal">RVC ticket</p>
        <h2 id="ticket-title" className="font-display text-4xl uppercase leading-none md:text-6xl">
          {event.title}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-body">
          <Words text={event.blurb} />
        </p>
        <LiveCountdown iso={event.startsAt} />
      </div>
      <div data-reveal className="flex w-full max-w-xl overflow-hidden bg-fg text-void lg:w-[34rem]">
        <div className="relative flex-1 p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-void/60">Admit one · {s.tag}</p>
          <p className="mt-3 font-display text-3xl uppercase leading-none">{formatDate(event.startsAt, { day: '2-digit', month: 'long' })}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-void/70">
            {event.venue}, {event.city}
          </p>
          <div className="mt-8">
            {needsMember ? (
              <Link to="/raw" className={btn('line', 'border-void text-void hover:bg-void hover:text-fg')}>
                Members only, join RAW
              </Link>
            ) : (
              <Link to={`/rsvp?event=${event.id}`} className={btn('solid', 'bg-signal text-fg [--sweep:var(--color-void)]')}>
                {s.cta} <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
        {/* Perforation: notches top and bottom joined by a dashed tear line. */}
        <div aria-hidden className="relative w-px border-l-2 border-dashed border-void/40">
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-void" />
          <span className="absolute -bottom-3 -left-3 size-6 rounded-full bg-void" />
        </div>
        <div className="grid w-32 place-items-center p-4 sm:w-40">
          <Qr seed={event.id} className="w-full text-void" />
          <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-void/60">{event.id.toUpperCase()}</p>
        </div>
      </div>
    </section>
  )
}

/** Tall cards with sideways titles; the hovered one widens. */
function PastNights() {
  const { shows } = useContent()
  return (
    <section aria-labelledby="past-title" className="mx-auto max-w-[1440px] px-4 pb-20 md:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 id="past-title" className="font-display text-3xl uppercase md:text-5xl">
          Before this one
        </h2>
        <Link to="/shows" className="text-xs uppercase tracking-[0.2em] underline underline-offset-4">
          Full archive
        </Link>
      </div>
      <ul className="flex h-[26rem] gap-2 md:h-[32rem]">
        {shows.slice(0, 5).map((s, i) => (
          <li key={s.id} data-reveal style={{ transitionDelay: `${i * 70}ms` }} className="group relative min-w-0 flex-1 overflow-hidden bg-fg transition-[flex-grow] duration-500 ease-out hover:flex-[3] focus-within:flex-[3]">
            <Link to={`/shows/${s.id}`} className="absolute inset-0">
              <span className="absolute inset-0 opacity-60 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0">
                <Media image={s.image} seed={s.id} scene={s.scene} label={s.title} ripple={false} />
              </span>
              <span className="absolute inset-0 bg-gradient-to-t from-fg/90 to-transparent" />
              <span className="absolute left-3 top-4 rotate-180 font-display text-xl uppercase text-void [writing-mode:vertical-rl] md:text-2xl">{s.title}</span>
              <span className="absolute bottom-3 left-3 grid size-10 place-items-center rounded-full border border-signal text-signal transition-colors group-hover:bg-signal group-hover:text-fg">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function EventDetail() {
  const { id = '' } = useParams()
  const { eventById } = useContent()
  const event = eventById(id)
  if (!event)
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8">
        <Empty title="That event isn't on the board" action={<Link to="/events" className={btn('line')}>All events</Link>} />
      </div>
    )
  return (
    <>
      <Hero event={event} />
      <Ticket event={event} />
      <section aria-labelledby="seats-title" className="bg-fg py-16 text-void">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-signal">Pick your spot</p>
          <h2 id="seats-title" className="mb-12 mt-2 font-display text-4xl uppercase leading-none md:text-6xl">
            Tiers and floor
          </h2>
          <ArenaMap tiers={event.tiers} />
        </div>
      </section>
      <div className="h-16" />
      <PastNights />
    </>
  )
}
