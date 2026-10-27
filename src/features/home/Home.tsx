import { ArrowUpRight, Lock } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ABOUT, EVENTS, PHOTOS, SHOWS } from '../../data/catalog'
import { countdown, formatDate } from '../../domain/rules'
import type { Scene } from '../../domain/types'
import { Frame } from '../../ui/Frame'
import { stagger } from '../../ui/reveal'
import { btn, Halftone } from '../../ui/ui'

const SECTIONS: { n: string; to: string; title: string; line: string; scene: Scene }[] = [
  { n: '01', to: '/photos', title: 'Exclusive Photos', line: 'The archive, shot from the pit and the roof.', scene: 'crowd' },
  { n: '02', to: '/videos', title: 'Exclusive Videos', line: 'Aftermovies, full sets, the build.', scene: 'stage' },
  { n: '03', to: '/merch', title: 'Exclusive Merch', line: 'Show drops. Never restocked.', scene: 'object' },
  { n: '04', to: '/shows', title: 'Past Shows', line: 'Every night since the basement.', scene: 'stadium' },
  { n: '05', to: '/events', title: 'Upcoming Events', line: 'Where we go next.', scene: 'crowd' },
  { n: '06', to: '/rsvp', title: 'RSVP / Booking', line: 'Lock your spot in two minutes.', scene: 'portrait' },
]

function useTick() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function Countdown({ iso }: { iso: string }) {
  const c = countdown(iso, useTick())
  return (
    <dl data-reveal className="grid grid-cols-4 border-y border-line bg-void">
      {(['days', 'hours', 'minutes', 'seconds'] as const).map((k) => (
        <div key={k} className="flex flex-col-reverse gap-1 border-r border-line px-2 py-5 text-center last:border-r-0 sm:py-8">
          <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
          <dd className="halftone mx-auto font-display text-4xl tabular [--ht-dot:4px] sm:text-6xl lg:text-8xl lg:[--ht-dot:6px]">
            <span className="halftone-ink px-[0.06em]">{String(c[k]).padStart(2, '0')}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function Home() {
  const next = EVENTS[0]
  const latest = SHOWS[0]
  const ticker = `NEXT · ${next.title} · ${formatDate(next.startsAt, { day: '2-digit', month: 'short', year: 'numeric' })} · ${next.venue} · RSVP OPEN · `

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line" aria-label="Raw Vision Collective">
        <div className="absolute inset-x-0 top-0 h-[56%] bg-panel" />
        <div className="grain absolute inset-x-0 bottom-0 h-[44%]">
          <Frame seed={latest.id} scene="stadium" label={`Aerial view of ${latest.venue}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/75" />
        </div>

        <div className="relative mx-auto flex min-h-[640px] max-w-[1440px] flex-col px-4 pb-8 pt-8 md:h-[calc(100dvh-4rem)] md:max-h-[920px] md:px-8">
          <Halftone lines={['Raw', 'Vision', 'Collective']} className="-ml-[0.04em] self-start text-[clamp(2.5rem,12.6vw,11rem)] [--ht-dot:4px] md:[--ht-dot:7px]" />
          <p className="absolute right-8 top-10 hidden max-w-[19rem] text-xs leading-relaxed text-body lg:block">{ABOUT}</p>

          <div className="mt-auto grid grid-cols-2 items-end gap-x-2 gap-y-4 text-center sm:grid-cols-[1fr_auto_1fr]">
            <p data-reveal style={stagger(1, 150)} className="text-left font-mono text-[clamp(2rem,6vw,5.5rem)] leading-none tracking-[0.08em]">NIGHT</p>
            <div data-reveal style={stagger(3, 150)} className="order-last col-span-2 space-y-2 text-xs [text-shadow:0_1px_10px_#000] uppercase tracking-[0.25em] sm:order-none sm:col-span-1 sm:pb-2 sm:text-[clamp(0.7rem,1.3vw,1.1rem)]">
              <p>{formatDate(next.startsAt)}</p>
              <p className="text-body">{next.venue}</p>
            </div>
            <p data-reveal style={stagger(2, 150)} className="text-right font-mono text-[clamp(2rem,6vw,5.5rem)] leading-none tracking-[0.08em]">SHIFT</p>
          </div>
          <div data-reveal style={{ '--d': '600ms' } as CSSProperties} className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={`/rsvp?event=${next.id}`} className={btn('solid', 'min-w-40')}>
              RSVP now
            </Link>
            <Link to="/events" className={btn('line', 'min-w-40 bg-black/30 backdrop-blur')}>
              All events
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-line bg-fg py-3 text-void" aria-hidden>
        <div className="animate-marquee flex w-max hover:[animation-play-state:paused] whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em]">
          <span>{ticker.repeat(4)}</span>
          <span>{ticker.repeat(4)}</span>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <p data-reveal className="border-b border-line py-10 text-sm leading-relaxed text-body lg:hidden">{ABOUT}</p>

        <section aria-labelledby="index-title" className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 id="index-title" className="text-xs uppercase tracking-[0.3em] text-muted">
              Index
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-subtle">07 rooms</p>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s, i) => (
              <Link key={s.to} to={s.to} data-reveal style={stagger(i)} className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden bg-void p-5">
                <div className="absolute inset-0 opacity-35 grayscale transition duration-500 group-hover:scale-105 group-hover:opacity-60">
                  <Frame seed={s.n} scene={s.scene} />
                </div>
                <div className="relative flex items-start justify-between text-xs tracking-[0.25em] text-muted">
                  <span>{s.n}</span>
                  <ArrowUpRight className="size-5 text-fg transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                </div>
                <div className="relative">
                  <h3 className="font-display text-3xl uppercase leading-none md:text-4xl">{s.title}</h3>
                  <p className="mt-3 text-xs text-body">{s.line}</p>
                </div>
              </Link>
            ))}
            <Link to="/raw" data-reveal className="group relative flex flex-col justify-between gap-10 overflow-hidden bg-fg p-5 text-void sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-end">
              <div>
                <p className="mb-6 flex items-center gap-2 text-xs tracking-[0.25em]">
                  07 <Lock className="size-3.5" aria-hidden /> Members only
                </p>
                <h3 className="font-display text-5xl uppercase leading-[0.9] md:text-7xl">Secret stuff</h3>
              </div>
              <p className="max-w-sm text-sm leading-relaxed">
                RAW Membership. Presale before anyone, the full vault, merch that never goes public. <span className="font-bold underline underline-offset-4">Enter the vault</span>
              </p>
            </Link>
          </div>
        </section>

        <section aria-labelledby="last-title" className="border-t border-line py-16">
          <div data-reveal className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Last show · {formatDate(latest.date)}</p>
              <h2 id="last-title" className="font-display text-4xl uppercase md:text-6xl">
                {latest.title}
              </h2>
            </div>
            <Link to={`/shows/${latest.id}`} className={btn('line', 'justify-self-start')}>
              Open the show
            </Link>
          </div>
          <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 md:-mx-8 md:scroll-px-8 md:px-8">
            {PHOTOS.filter((p) => !p.membersOnly)
              .slice(0, 8)
              .map((p, i) => (
                <li key={p.id} data-reveal style={stagger(i, 90)} className="w-[72vw] shrink-0 snap-start sm:w-[40vw] lg:w-[26rem]">
                  <Link to={`/photos?show=${encodeURIComponent(SHOWS.find((s) => s.id === p.showId)?.title ?? '')}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-panel">
                      <div className="size-full transition-transform duration-700 group-hover:scale-105">
                        <Frame seed={p.id} scene={p.scene} label={p.caption} />
                      </div>
                    </div>
                    <p className="mt-3 flex justify-between gap-3 text-[11px] uppercase tracking-[0.18em]">
                      <span className="truncate">{p.caption}</span>
                      <span className="shrink-0 text-muted">{p.credit}</span>
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        <section aria-labelledby="next-title" className="border-t border-line py-16">
          <div data-reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Next up</p>
              <h2 id="next-title" className="font-display text-4xl uppercase md:text-6xl">
                {next.title}
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-body">
              {next.venue}, {next.city}
            </p>
          </div>
          <Countdown iso={next.startsAt} />
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {EVENTS.slice(1).map((e, i) => (
              <li key={e.id} data-reveal style={stagger(i)}>
                <Link to={`/events#${e.id}`} className="group grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-5 hover:bg-panel sm:grid-cols-[8rem_1fr_10rem_auto] sm:px-3">
                  <span className="text-xs tabular text-muted">{formatDate(e.startsAt, { day: '2-digit', month: 'short' })}</span>
                  <span className="truncate text-sm font-bold uppercase sm:text-base">{e.title}</span>
                  <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:block">{e.city}</span>
                  <ArrowUpRight className="size-4 text-muted group-hover:text-fg" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
