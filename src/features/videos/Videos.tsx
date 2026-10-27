import { Play, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { VIDEO_KINDS, type Video } from '../../domain/types'
import { SplitText } from '../../ui/fx'
import { youtubeId } from '../../ui/image'
import { Media } from '../../ui/Media'
import { useDialog } from '../../ui/useDialog'
import { stagger } from '../../ui/reveal'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, MembersLock, PageHead, StatusTag } from '../../ui/ui'

function Player({ video, onClose }: { video: Video; onClose: () => void }) {
  const ref = useDialog(true, onClose)
  const yt = youtubeId(video.url ?? '')
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={video.title} className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <p className="truncate text-sm font-bold uppercase">{video.title}</p>
        <button type="button" onClick={onClose} aria-label="Close player" className="grid size-10 shrink-0 place-items-center hover:bg-white/10">
          <X className="size-6" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-8 md:px-16">
        <div className="aspect-video w-full max-w-6xl bg-black">
          {yt ? (
            <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="size-full" />
          ) : (
            <video src={video.url} controls autoPlay className="size-full" />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Videos() {
  const { videos: VIDEOS, showById } = useContent()
  const { member, toast } = useStore()
  const [kind, setKind] = useFilter<(typeof VIDEO_KINDS)[number]>('kind')
  const list = VIDEOS.filter((v) => kind === 'All' || v.kind === kind)
  const [featuredId, setFeaturedId] = useState(VIDEOS[0].id)
  const featured = VIDEOS.find((v) => v.id === featuredId) ?? VIDEOS[0]

  const [playing, setPlaying] = useState<Video | null>(null)
  const play = (v: Video) => (v.url ? setPlaying(v) : toast('No video file yet', `Add a YouTube or video link to ${v.title} in the admin.`))

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="02" kicker="Screening room" title={'Exclusive\nVideos'}>
        Aftermovies for everyone. Full live sets, the build and the founders' tapes for RAW members.
      </PageHead>

      <section aria-label="Featured video" className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grain relative aspect-video overflow-hidden bg-panel">
          <Media image={featured.image} seed={featured.id} scene={featured.scene} label={featured.title} cursor="Play" />
          <button type="button" onClick={() => play(featured)} aria-label={`Play ${featured.title}`} data-cursor="Play" className="group absolute inset-0 grid place-items-center bg-black/30 hover:bg-black/10">
            <span className="grid size-20 place-items-center rounded-full border border-white bg-black/40 text-white backdrop-blur transition-transform group-hover:scale-105 md:size-24">
              <Play className="ml-1 size-8 fill-white" />
            </span>
          </button>
        </div>
        <div className="flex flex-col justify-between gap-6 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="space-y-3">
            <StatusTag tone="muted">{featured.kind}</StatusTag>
            <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">
              <SplitText key={featured.id} text={featured.title} step={16} />
            </h2>
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
                    <Media image={v.image} seed={v.id} scene={v.scene} cursor="Play" />
                  </div>
                  {locked ? (
                    <MembersLock compact />
                  ) : (
                    <button type="button" onClick={() => setFeaturedId(v.id)} aria-label={`Feature ${v.title}`} data-cursor="Play" aria-pressed={v.id === featured.id} className={`absolute inset-0 grid place-items-center transition-colors hover:bg-black/30 ${v.id === featured.id ? 'outline outline-2 -outline-offset-2 outline-fg' : ''}`}>
                      <Play className="size-7 fill-white text-white opacity-90" aria-hidden />
                    </button>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[10px] text-white tabular">{v.minutes}:00</span>
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
      {playing && <Player video={playing} onClose={() => setPlaying(null)} />}
    </div>
  )
}
