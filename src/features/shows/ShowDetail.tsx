import { ArrowLeft, ArrowUpRight, Lock, Play } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { formatDate } from '../../domain/rules'
import { Words } from '../../ui/fx'
import { Media } from '../../ui/Media'
import { CountUp } from '../../ui/motion'
import { CrossBands, Glitch, Sticker } from '../../ui/scene'
import { btn, Empty } from '../../ui/ui'

// Scattered sticker spots for the first five photos on wide screens: left %, top %, width %, tilt.
const SPOTS = [
  [2, 6, 30, -7],
  [30, 0, 26, 4],
  [55, 10, 24, -3],
  [76, 2, 22, 8],
  [40, 52, 24, -5],
] as const

export default function ShowDetail() {
  const { photos: PHOTOS, videos: VIDEOS, shows: SHOWS, showById } = useContent()
  const { id = '' } = useParams()
  const { member } = useStore()
  const show = showById(id)

  if (!show)
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-24 md:px-8">
        <Empty title="That show isn't in the archive" action={<Link to="/shows" className={btn('line')}>All past shows</Link>} />
      </div>
    )

  const photos = PHOTOS.filter((p) => p.showId === show.id)
  const videos = VIDEOS.filter((v) => v.showId === show.id)
  const next = SHOWS[(SHOWS.indexOf(show) + 1) % SHOWS.length]
  const crowd = Number(show.headcount.replace(/\D/g, ''))
  const locked = (membersOnly?: boolean) => membersOnly && !member
  const galleryLink = `/photos?show=${encodeURIComponent(show.title)}`

  return (
    <>
      <section className="relative isolate h-[78vh] min-h-[520px] overflow-hidden bg-fg text-void">
        <div className="kenburns absolute inset-0 opacity-70">
          <Media image={show.image} seed={show.id} scene={show.scene} label={`${show.title} at ${show.venue}`} ripple={false} />
        </div>
        <div aria-hidden className="scanline absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-fg via-fg/40 to-fg/20" />
        <div aria-hidden className="strobe pointer-events-none absolute inset-0 z-20 bg-void" />
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-between px-4 pb-24 pt-6 md:px-8">
          <Link to="/shows" className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-void/70 hover:text-void">
            <ArrowLeft className="size-4" /> Past shows
          </Link>
          <div>
            <p className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em]">
              <span className="animate-blink inline-block size-2 rounded-full bg-signal" /> Archive · {formatDate(show.date)}
              <span className="rounded-full border border-void/50 px-3 py-1">{show.city}</span>
            </p>
            <h1 className="font-display text-[clamp(2.8rem,10vw,9rem)] uppercase leading-[0.85] tracking-[-0.04em]">
              <Glitch text={show.title} />
            </h1>
          </div>
        </div>
        <div className="absolute inset-x-0 -bottom-3">
          <CrossBands items={[show.venue, show.city, formatDate(show.date, { month: 'short', year: 'numeric' }), `${show.headcount} crowd`]} />
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <dl data-reveal className="grid grid-cols-2 border-b border-line md:grid-cols-4">
          {[
            ['Date', formatDate(show.date, { day: '2-digit', month: 'short' })],
            ['Venue', show.venue],
            ['City', show.city],
            ['Crowd', crowd ? <CountUp key="crowd" value={crowd} format={(n) => n.toLocaleString('en-US')} /> : show.headcount],
          ].map(([k, v], i) => (
            <div key={String(k)} className="border-r border-line py-8 pr-4 last:border-r-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r">
              <dt className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted">
                0{i + 1} / {k}
              </dt>
              <dd className="font-display text-xl uppercase leading-tight md:text-3xl">{v}</dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="max-w-3xl py-12 font-display text-2xl uppercase leading-tight md:text-4xl">
          <Words key={show.id} text={show.blurb} />
        </p>

        <section aria-labelledby="show-photos" className="py-6">
          <div className="mb-6 flex items-end justify-between">
            <h2 id="show-photos" className="font-display text-3xl uppercase md:text-5xl">
              Frames <span className="text-signal">({photos.length})</span>
            </h2>
            <Link to={galleryLink} className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:text-signal">
              Open the wall
            </Link>
          </div>
          {/* Wide screens: the first five land as tilted stickers. Phones and the rest: a plain grid. */}
          <div className="relative hidden h-[36rem] md:block">
            {photos.slice(0, 5).map((p, i) => {
              const [left, top, width, tilt] = SPOTS[i]
              return (
                <Link key={p.id} to={locked(p.membersOnly) ? '/raw' : galleryLink} data-cursor="View" className="group absolute transition-transform duration-300 hover:z-10 hover:scale-105" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, aspectRatio: p.tall ? '3/4' : '4/3', rotate: `${tilt}deg` }}>
                  <Sticker image={p.image} seed={p.id} scene={p.scene} label={p.caption} shape={i} className={`size-full ${locked(p.membersOnly) ? 'blur-sm' : ''}`} style={{ animationDelay: `${i * 140}ms, ${700 + i * 400}ms` }} />
                  <span className="absolute -bottom-3 left-4 bg-fg px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-void opacity-0 transition-opacity group-hover:opacity-100">
                    {locked(p.membersOnly) ? 'RAW members' : p.caption}
                  </span>
                </Link>
              )
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-4 md:[&>*:nth-child(-n+5)]:hidden">
            {photos.map((p) => (
              <Link key={p.id} className="group relative aspect-square overflow-hidden bg-panel" to={locked(p.membersOnly) ? '/raw' : galleryLink}>
                <div className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${locked(p.membersOnly) ? 'blur-sm' : ''}`}>
                  <Media image={p.image} seed={p.id} scene={p.scene} label={p.caption} />
                </div>
                {locked(p.membersOnly) && <Lock className="absolute left-3 top-3 size-4" aria-label="RAW members only" />}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="show-videos" className="py-12">
          <h2 id="show-videos" className="mb-6 font-display text-3xl uppercase md:text-5xl">
            Tapes <span className="text-signal">({videos.length})</span>
          </h2>
          <ul className="border-t border-fg">
            {videos.map((v, i) => (
              <li key={v.id} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <Link to={locked(v.membersOnly) ? '/raw' : `/videos?kind=${encodeURIComponent(v.kind)}`} className="group relative flex items-center gap-4 overflow-hidden border-b border-fg py-5 sm:px-3">
                  <span aria-hidden className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <span className="relative text-xs tabular text-muted group-hover:text-fg">{String(i + 1).padStart(2, '0')}</span>
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-full border border-fg transition-colors group-hover:bg-fg group-hover:text-void">
                    {locked(v.membersOnly) ? <Lock className="size-3.5" aria-label="RAW members only" /> : <Play className="ml-0.5 size-3.5 fill-current" aria-hidden />}
                  </span>
                  <span className="relative flex-1 font-display text-lg uppercase leading-tight transition-transform duration-500 group-hover:translate-x-2 md:text-2xl">{v.title}</span>
                  <span className="relative hidden shrink-0 text-xs uppercase tracking-[0.15em] text-muted group-hover:text-fg sm:block">
                    {v.kind} · {v.minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link to={`/shows/${next.id}`} className="group relative mt-6 block overflow-hidden bg-fg py-16 text-void">
        <span className="absolute inset-0 opacity-0 grayscale transition-opacity duration-700 group-hover:opacity-40">
          <Media image={next.image} seed={next.id} scene={next.scene} ripple={false} />
        </span>
        <span className="relative mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-4 md:px-8">
          <span>
            <span className="mb-3 block text-xs uppercase tracking-[0.3em] text-void/60">Next in archive · {formatDate(next.date, { month: 'short', year: 'numeric' })}</span>
            <span className="block font-display text-4xl uppercase leading-none transition-transform duration-500 group-hover:translate-x-3 md:text-7xl">{next.title}</span>
          </span>
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-signal text-fg transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="size-6" />
          </span>
        </span>
      </Link>
    </>
  )
}
