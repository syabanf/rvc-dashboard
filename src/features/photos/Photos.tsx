import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { Media } from '../../ui/Media'
import type { Photo } from '../../domain/types'
import { useDialog } from '../../ui/useDialog'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty } from '../../ui/ui'
import { Wall, WallCaption, WallLock, WallPage } from '../../ui/Wall'

const ratio = (p: Photo) => (p.tall ? 0.78 : 1.35)

export default function Photos() {
  const { photos: PHOTOS, shows: SHOWS, showById } = useContent()
  const SHOW_TITLES = SHOWS.map((s) => s.title)
  const titleOf = (showId: string) => showById(showId)?.title ?? ''
  const { member } = useStore()
  const navigate = useNavigate()
  const [show, setShow] = useFilter<string>('show')
  const [open, setOpen] = useState<number | null>(null)
  const list = PHOTOS.filter((p) => show === 'All' || titleOf(p.showId) === show)
  const viewable = list.filter((p) => member || !p.membersOnly)
  const close = () => setOpen(null)
  const ref = useDialog(open !== null, close)
  const current = open !== null ? viewable[open] : null

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % viewable.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + viewable.length) % viewable.length))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, viewable.length])

  const openTile = (p: Photo) => (p.membersOnly && !member ? navigate('/raw') : setOpen(viewable.indexOf(p)))

  return (
    <>
      <WallPage
        kicker="01 / Archive"
        title="Exclusive Photos"
        intro={`${list.length} frames on one wall, ${list.filter((p) => p.membersOnly).length} locked for RAW members. Drag anywhere, scroll or use the arrow keys. Tap a frame to open it.`}
        filters={<Chips label="Filter by show" options={SHOW_TITLES} value={show} onChange={setShow} counts={countBy(PHOTOS, (p) => titleOf(p.showId))} />}
        empty={list.length === 0 && <Empty title="No photos for this show yet" action={<button type="button" className={btn('line')} onClick={() => setShow('All')}>Clear filter</button>} />}
      >
        <Wall key={show} items={list} ratio={ratio} onOpen={openTile} label="Photo wall. Drag, scroll or use the arrow keys to move. Enter opens the photo in the middle.">
          {(p) => {
            const locked = p.membersOnly && !member
            return (
              <>
                <div className={`size-full ${locked ? 'scale-110 blur-md' : ''}`}>
                  <Media image={p.image} seed={p.id} scene={p.scene} label={p.caption} ripple={false} />
                </div>
                {locked && <WallLock />}
                <WallCaption title={p.caption} meta={p.credit} />
              </>
            )
          }}
        </Wall>
      </WallPage>

      {current && (
        <div ref={ref} role="dialog" aria-modal="true" aria-label={current.caption} className="fixed inset-0 z-50 flex flex-col bg-void/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted tabular">
              {(open ?? 0) + 1} / {viewable.length}
            </p>
            <button type="button" onClick={close} aria-label="Close" className="grid size-10 place-items-center hover:bg-hover">
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <div className={`max-h-full w-full ${current.tall ? 'max-w-[min(60vh,32rem)] aspect-[3/4]' : 'max-w-5xl aspect-[4/3]'}`}>
              <Media image={current.image} seed={current.id} scene={current.scene} label={current.caption} className="object-contain" />
            </div>
            <button type="button" aria-label="Previous photo" onClick={() => setOpen((i) => ((i ?? 0) - 1 + viewable.length) % viewable.length)} className="absolute left-2 grid size-12 place-items-center bg-panel/80 hover:bg-hover md:left-6">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => setOpen((i) => ((i ?? 0) + 1) % viewable.length)} className="absolute right-2 grid size-12 place-items-center bg-panel/80 hover:bg-hover md:right-6">
              <ChevronRight className="size-6" />
            </button>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-5 md:px-8">
            <p className="text-sm font-bold uppercase">{current.caption}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {titleOf(current.showId)} · Photo by {current.credit}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
