import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '../../app/store'
import { PHOTOS, SHOWS, showById } from '../../data/catalog'
import { Frame } from '../../ui/Frame'
import { stagger } from '../../ui/reveal'
import { useDialog } from '../../ui/useDialog'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, MembersLock, PageHead } from '../../ui/ui'

const SHOW_TITLES = SHOWS.map((s) => s.title)
const titleOf = (showId: string) => showById(showId)?.title ?? ''

export default function Photos() {
  const { member } = useStore()
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

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="01" kicker="Archive" title={'Exclusive\nPhotos'}>
        Shot from the pit, the roof and the crew stairs. {PHOTOS.filter((p) => p.membersOnly).length} frames stay locked for RAW members.
      </PageHead>
      <Chips label="Filter by show" options={SHOW_TITLES} value={show} onChange={setShow} counts={countBy(PHOTOS, (p) => titleOf(p.showId))} />

      {list.length === 0 ? (
        <Empty title="No photos for this show yet" action={<button type="button" className={btn('line')} onClick={() => setShow('All')}>Clear filter</button>} />
      ) : (
        <ul className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
          {list.map((p, i) => {
            const locked = p.membersOnly && !member
            return (
              <li key={p.id} data-reveal style={stagger(i)} className="relative break-inside-avoid">
                <figure className={`group relative overflow-hidden bg-panel ${p.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                  <div className={`absolute inset-0 transition-transform duration-700 ${locked ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`}>
                    <Frame seed={p.id} scene={p.scene} label={p.caption} />
                  </div>
                  {locked ? (
                    <MembersLock />
                  ) : (
                    <button type="button" onClick={() => setOpen(viewable.indexOf(p))} aria-label={`Open ${p.caption}`} className="group absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 text-left text-white opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100">
                      <span className="text-[11px] uppercase tracking-[0.15em]">{p.caption}</span>
                    </button>
                  )}
                </figure>
              </li>
            )
          })}
        </ul>
      )}

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
              <Frame seed={current.id} scene={current.scene} label={current.caption} />
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
    </div>
  )
}
