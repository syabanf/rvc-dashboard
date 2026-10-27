import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useStore } from '../../app/store'
import { EVENTS } from '../../data/catalog'
import { countdown, formatDate, formatIDR } from '../../domain/rules'
import type { UpcomingEvent } from '../../domain/types'
import { Frame } from '../../ui/Frame'
import { btn, PageHead, StatusTag } from '../../ui/ui'

const STATUS: Record<UpcomingEvent['status'], { tag: string; tone: 'live' | 'muted' | 'solid'; cta: string }> = {
  open: { tag: 'Tickets on sale', tone: 'live', cta: 'Book tickets' },
  presale: { tag: 'RAW presale', tone: 'solid', cta: 'Book presale' },
  waitlist: { tag: 'Waitlist', tone: 'muted', cta: 'Join waitlist' },
}

export default function Events() {
  const { hash } = useLocation()
  const { member } = useStore()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="05" kicker="Calendar" title={'Upcoming\nEvents'}>
        {EVENTS.length} dates on the board. RAW members book presale 48 hours before the public.
      </PageHead>
      <ol className="mt-10 space-y-6">
        {EVENTS.map((e) => {
          const s = STATUS[e.status]
          const c = countdown(e.startsAt)
          const from = Math.min(...e.tiers.filter((t) => !t.soldOut).map((t) => t.price))
          const needsMember = e.status === 'presale' && !member
          return (
            <li key={e.id} id={e.id} data-reveal className="group scroll-mt-24 grid overflow-hidden border border-line bg-panel md:grid-cols-[minmax(0,26rem)_1fr]">
              <div className="grain relative aspect-[16/10] md:aspect-auto">
                <Frame seed={e.id} scene={e.status === 'open' ? 'stage' : 'crowd'} />
                <div className="absolute left-4 top-4">
                  <StatusTag tone={s.tone}>{s.tag}</StatusTag>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-5 md:p-8">
                <div className="grid grid-cols-[1fr_auto] items-start gap-6">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted tabular">{formatDate(e.startsAt, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <h2 className="font-display text-3xl uppercase leading-none md:text-5xl">{e.title}</h2>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-body">
                      {e.venue}, {e.city}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-right text-[10px] uppercase tracking-[0.2em] text-muted">
                    <span className="block font-display text-4xl text-fg tabular md:text-5xl">{c.days}</span>
                    days to go
                  </p>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-body">{e.blurb}</p>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {from > 0 ? (
                      <>
                        From <span className="text-base text-fg tabular">{formatIDR(from)}</span>
                      </>
                    ) : (
                      'Free to join'
                    )}
                  </p>
                  {needsMember ? (
                    <Link to="/raw" className={btn('line')}>
                      Members only, join RAW
                    </Link>
                  ) : (
                    <Link to={`/rsvp?event=${e.id}`} className={btn('solid')}>
                      {s.cta}
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
