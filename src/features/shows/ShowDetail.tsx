import { ArrowLeft, Lock } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { formatDate } from '../../domain/rules'
import { Words } from '../../ui/fx'
import { Media } from '../../ui/Media'
import { btn, Empty, Halftone } from '../../ui/ui'

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
  const idx = SHOWS.indexOf(show)
  const next = SHOWS[(idx + 1) % SHOWS.length]

  return (
    <>
      <section className="grain relative h-[62vh] min-h-[420px] overflow-hidden border-b border-line">
        <Media image={show.image} seed={show.id} scene={show.scene} label={`${show.title} at ${show.venue}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-4 pb-8 md:px-8">
          <Link to="/shows" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-body hover:text-fg">
            <ArrowLeft className="size-4" /> Past shows
          </Link>
          <Halftone lines={[show.title]} className="text-[clamp(2.2rem,7vw,6.5rem)] [--ht-dot:6px]" />
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <dl data-reveal className="grid grid-cols-2 border-b border-line md:grid-cols-4">
          {[
            ['Date', formatDate(show.date)],
            ['Venue', show.venue],
            ['City', show.city],
            ['Crowd', show.headcount],
          ].map(([k, v]) => (
            <div key={k} className="border-r border-line py-6 pr-4 last:border-r-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r">
              <dt className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
              <dd className="text-sm uppercase">{v}</dd>
            </div>
          ))}
        </dl>
        <p data-reveal className="max-w-2xl py-10 text-lg leading-relaxed text-body">
          <Words key={show.id} text={show.blurb} />
        </p>

        <section data-reveal aria-labelledby="show-photos" className="py-6">
          <div className="mb-5 flex items-end justify-between">
            <h2 id="show-photos" className="text-xs uppercase tracking-[0.3em] text-muted">Photos ({photos.length})</h2>
            <Link to={`/photos?show=${encodeURIComponent(show.title)}`} className="text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:text-body">
              Open gallery
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {photos.map((p) => (
              <Link key={p.id} className="group relative aspect-square overflow-hidden bg-panel" to={p.membersOnly && !member ? '/raw' : `/photos?show=${encodeURIComponent(show.title)}`}>
                <div className={`absolute inset-0 ${p.membersOnly && !member ? 'blur-sm' : ''}`}>
                  <Media image={p.image} seed={p.id} scene={p.scene} label={p.caption} />
                </div>
                {p.membersOnly && !member && <Lock className="absolute left-3 top-3 size-4" aria-label="RAW members only" />}
              </Link>
            ))}
          </div>
        </section>

        <section data-reveal aria-labelledby="show-videos" className="py-10">
          <h2 id="show-videos" className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">Videos ({videos.length})</h2>
          <ul className="divide-y divide-line border-y border-line">
            {videos.map((v) => (
              <li key={v.id}>
                <Link to={v.membersOnly && !member ? '/raw' : `/videos?kind=${encodeURIComponent(v.kind)}`} className="flex items-center justify-between gap-4 py-4 hover:bg-panel sm:px-3">
                  <span className="text-sm font-bold uppercase">{v.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted">
                    {v.membersOnly && !member && <Lock className="size-3.5" aria-label="RAW members only" />}
                    {v.kind} · {v.minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link to={`/shows/${next.id}`} className="group mt-6 flex items-end justify-between gap-6 border-t border-line pt-8">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted">Next in archive</p>
            <p className="font-display text-3xl uppercase transition-transform group-hover:translate-x-2 md:text-5xl">{next.title}</p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted">{formatDate(next.date, { month: 'short', year: 'numeric' })}</span>
        </Link>
      </div>
    </>
  )
}
