import { X } from 'lucide-react'
import type { Video } from '../domain/types'
import { youtubeId } from './image'
import { useDialog } from './useDialog'

/** Full-screen player for a YouTube link or a direct video file. */
export function Player({ video, onClose }: { video: Video; onClose: () => void }) {
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
