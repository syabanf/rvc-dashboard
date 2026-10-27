import { Play } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../app/store'
import { showById, VIDEOS } from '../../data/catalog'
import { VIDEO_KINDS, type Video } from '../../domain/types'
import { Frame } from '../../ui/Frame'
import { stagger } from '../../ui/reveal'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, MembersLock, PageHead, StatusTag } from '../../ui/ui'

export default function Videos() {
  const { member, toast } = useStore()
  const [kind, setKind] = useFilter<(typeof VIDEO_KINDS)[number]>('kind')
  const list = VIDEOS.filter((v) => kind === 'All' || v.kind === kind)
  const [featuredId, setFeaturedId] = useState(VIDEOS[0].id)
  const featured = VIDEOS.find((v) => v.id === featuredId) ?? VIDEOS[0]

  const play = (v: Video) => toast('Player not connected', `${v.title} streams once the media host is set up.`)

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="02" kicker="Screening room" title={'Exclusive\nVideos'}>
        Aftermovies for everyone. Full live sets, the build and the founders' tapes for RAW members.
      </PageHead>

      <section aria-label="Featured video" className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grain relative aspect-video overflow-hidden bg-panel">
          <Frame seed={featured.id} scene={featured.scene} label={featured.title} />
          <button type="button" onClick={() => play(featured)} aria-label={`Play ${featured.title}`} className="group absolute inset-0 grid place-items-center bg-black/30 hover:bg-black/10">
            <span className="grid size-20 place-items-center rounded-full border border-fg bg-black/40 backdrop-blur transition-transform group-hover:scale-105 md:size-24">
              <Play className="ml-1 size-8 fill-fg" />
            </span>
          </button>
        </div>
        <div className="flex flex-col justify-between gap-6 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="space-y-3">
            <StatusTag tone="muted">{featured.kind}</StatusTag>
            <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">{featured.title}</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {showById(featured.showId)?.title} · {featured.minutes} min
            </p>
          </div>
          <button type="button" className={btn('solid', 'w-full')} onClick={() => play(featured)}>
            <Play className="size-4 fill-void" /> Watch now
          </button>
        </div>
      </section>

      <Chips label="Filter by type" options={VIDEO_KINDS} value={kind} onChange={setKind} counts={countBy(VIDEOS, (v) => v.kind)} />

      {list.length === 0 ? (
        <Empty title="Nothing in this category" action={<button type="button" className={btn('line')} onClick={() => setKind('All')}>Clear filter</button>} />
      ) : (
        <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((v, i) => {
            const locked = v.membersOnly && !member
            return (
              <li key={v.id} data-reveal style={stagger(i)}>
                <div className="group relative aspect-video overflow-hidden bg-panel">
                  <div className={`absolute inset-0 transition-transform duration-700 ${locked ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`}>
                    <Frame seed={v.id} scene={v.scene} />
                  </div>
                  {locked ? (
                    <MembersLock compact />
                  ) : (
                    <button type="button" onClick={() => setFeaturedId(v.id)} aria-label={`Feature ${v.title}`} aria-pressed={v.id === featured.id} className={`absolute inset-0 grid place-items-center transition-colors hover:bg-black/30 ${v.id === featured.id ? 'outline outline-2 -outline-offset-2 outline-fg' : ''}`}>
                      <Play className="size-7 fill-fg opacity-80" aria-hidden />
                    </button>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[10px] tabular">{v.minutes}:00</span>
                </div>
                <p className="mt-3 text-sm font-bold uppercase leading-snug">{v.title}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                  {v.kind} · {showById(v.showId)?.title}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
