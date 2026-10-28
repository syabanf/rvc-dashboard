import { Play, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { VIDEO_KINDS, type Video } from '../../domain/types'
import { youtubeId } from '../../ui/image'
import { Media } from '../../ui/Media'
import { useDialog } from '../../ui/useDialog'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty } from '../../ui/ui'
import { Wall, WallCaption, WallLock, WallPage } from '../../ui/Wall'

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

const ratio = () => 16 / 9

export default function Videos() {
  const { videos: VIDEOS, showById } = useContent()
  const { member, toast } = useStore()
  const navigate = useNavigate()
  const [kind, setKind] = useFilter<(typeof VIDEO_KINDS)[number]>('kind')
  const list = VIDEOS.filter((v) => kind === 'All' || v.kind === kind)
  const [playing, setPlaying] = useState<Video | null>(null)
  const play = (v: Video) => {
    if (v.membersOnly && !member) navigate('/raw')
    else if (v.url) setPlaying(v)
    else toast('No video file yet', `Add a YouTube or video link to ${v.title} in the admin.`)
  }

  return (
    <>
      <WallPage
        kicker="02 / Screening room"
        title="Exclusive Videos"
        intro={`${list.length} films on one wall. Aftermovies for everyone, live sets and the founders' tapes for RAW members. Drag to browse, tap a film to play it.`}
        filters={<Chips label="Filter by type" options={VIDEO_KINDS} value={kind} onChange={setKind} counts={countBy(VIDEOS, (v) => v.kind)} />}
        empty={list.length === 0 && <Empty title="Nothing in this category" action={<button type="button" className={btn('line')} onClick={() => setKind('All')}>Clear filter</button>} />}
      >
        <Wall key={kind} items={list} ratio={ratio} onOpen={play} label="Video wall. Drag, scroll or use the arrow keys to move. Enter plays the film in the middle.">
          {(v) => {
            const locked = v.membersOnly && !member
            return (
              <>
                <div className={`size-full ${locked ? 'scale-110 blur-md' : ''}`}>
                  <Media image={v.image} seed={v.id} scene={v.scene} label={v.title} ripple={false} />
                </div>
                {locked ? (
                  <WallLock />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-14 place-items-center rounded-full border border-white bg-black/40 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 size-5 fill-white" aria-hidden />
                    </span>
                  </span>
                )}
                <span className="absolute right-2.5 top-2.5 bg-black/70 px-1.5 py-0.5 text-[10px] text-white tabular">{v.minutes}:00</span>
                <WallCaption title={v.title} meta={`${v.kind} · ${showById(v.showId)?.title ?? ''}`} />
              </>
            )
          }}
        </Wall>
      </WallPage>
      {playing && <Player video={playing} onClose={() => setPlaying(null)} />}
    </>
  )
}
