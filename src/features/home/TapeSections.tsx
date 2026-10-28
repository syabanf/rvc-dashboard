import { Link } from 'react-router'
import type { UpcomingEvent } from '../../domain/types'
import { Magnetic } from '../../ui/fx'
import { btn } from '../../ui/ui'

const corner = 'absolute size-5 border-fg md:size-7'

/** Crop marks, side markers and deck labels laid over the hero, like the frame of tape software. */
export function HudMarks({ code }: { code: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-10 md:inset-5">
      <span className={`${corner} left-0 top-0 border-l border-t`} />
      <span className={`${corner} right-0 top-0 border-r border-t`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r`} />
      <span className="absolute left-0 top-[56%] size-0 -translate-y-1/2 border-y-[10px] border-l-[12px] border-y-transparent border-l-fg" />
      <span className="absolute right-0 top-[56%] size-0 -translate-y-1/2 border-y-[10px] border-r-[12px] border-y-transparent border-r-fg" />
      <p className="absolute bottom-2 left-8 hidden text-[9px] uppercase leading-relaxed tracking-[0.2em] text-body md:block">
        ID {code}
        <br />
        Side A · Live system
      </p>
      <p className="absolute bottom-2 right-8 hidden text-right text-[9px] uppercase leading-relaxed tracking-[0.2em] text-body md:block">
        <span className="mr-1 inline-block size-1.5 animate-blink rounded-full bg-signal" /> Rec
        <br />
        120 BPM · 00:00:21
      </p>
    </div>
  )
}

/** A red tab at the foot of the page that opens into a full red booking panel as it scrolls in. */
export function RsvpCta({ event }: { event: UpcomingEvent }) {
  return (
    <section aria-labelledby="cta-title" className="mt-24">
      <div className="cta-open relative flex min-h-[88vh] flex-col justify-between overflow-hidden bg-signal px-4 py-8 text-fg md:px-8">
        <div className="mx-auto flex w-full max-w-[1440px] items-start justify-between text-[10px] uppercase tracking-[0.3em]">
          <span>Next · {event.title}</span>
          <span className="hidden sm:inline">{event.venue}</span>
        </div>
        <h2 id="cta-title" className="cta-rise mx-auto flex w-full max-w-[1440px] items-end justify-between font-display text-[clamp(3rem,14.5vw,15rem)] uppercase leading-[0.78] tracking-[-0.05em]">
          <span className="inline-block origin-bottom scale-y-[1.3]">RSVP</span>
          <svg viewBox="0 0 60 120" aria-hidden className="mb-[0.08em] h-[0.6em] shrink-0">
            <path d="M30 4 C 52 12, 8 22, 30 30 S 8 48, 30 56 S 52 74, 30 82 S 10 96, 30 104" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <circle cx="30" cy="108" r="10" fill="currentColor" />
          </svg>
          <span className="inline-block origin-bottom scale-y-[1.3]">Now</span>
        </h2>
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-end justify-between gap-4">
          <p className="max-w-xs text-sm leading-relaxed">{event.blurb}</p>
          <Magnetic>
            <Link to={`/rsvp?event=${event.id}`} className={btn('solid', 'h-12 min-w-48 [--sweep:var(--color-void)] hover:text-fg')}>
              Book your spot
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
