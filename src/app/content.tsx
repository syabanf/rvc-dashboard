import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ABOUT, EVENTS, MERCH, PHOTOS, PLANS, RAW_CODE, SHOWS, VIDEOS } from '../data/catalog'
import type { MembershipPlan, MerchItem, PastShow, Photo, Site, UpcomingEvent, Video } from '../domain/types'
import { useStore } from './store'

export type Content = {
  site: Site
  events: UpcomingEvent[]
  shows: PastShow[]
  photos: Photo[]
  videos: Video[]
  merch: MerchItem[]
  plans: MembershipPlan[]
}
export type Collection = Exclude<keyof Content, 'site'>
type Item<K extends Collection> = Content[K][number]

const DEFAULTS: Content = {
  site: { about: ABOUT, heroEventId: EVENTS[0].id, heroLeft: 'NIGHT', heroRight: 'SHIFT', ticker: '', rawCode: RAW_CODE },
  events: EVENTS,
  shows: SHOWS,
  photos: PHOTOS,
  videos: VIDEOS,
  merch: MERCH,
  plans: PLANS,
}
const KEY = 'rvc.content'

type ContentApi = Content & {
  upsert: <K extends Collection>(k: K, item: Item<K>) => void
  remove: (k: Collection, id: string) => void
  setSite: (patch: Partial<Site>) => void
  reset: () => void
  eventById: (id: string) => UpcomingEvent | undefined
  showById: (id: string) => PastShow | undefined
  featured: UpcomingEvent
}

const Ctx = createContext<ContentApi | null>(null)

function load(): Content {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const saved = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Content>) }
    // Saved copies predate the seed photos, so items without an image pick up the seed one.
    for (const k of ['events', 'shows', 'photos', 'videos', 'merch'] as const) {
      const seed = new Map<string, { image?: string }>(DEFAULTS[k].map((x) => [x.id, x]))
      saved[k] = saved[k].map((x) => (x.image ? x : { ...x, image: seed.get(x.id)?.image })) as never
    }
    return saved
  } catch {
    return DEFAULTS
  }
}

/** Everything the landing pages show. Admin edits it; it saves to this browser until a CMS backend exists. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const { toast } = useStore()
  const [content, setContent] = useState(load)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(content))
    } catch {
      toast('Browser storage is full', 'The last change shows now but will not survive a reload. Remove a few uploaded images.')
    }
  }, [content, toast])

  const value = useMemo<ContentApi>(() => {
    const events = [...content.events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    const shows = [...content.shows].sort((a, b) => b.date.localeCompare(a.date))
    return {
      ...content,
      events,
      shows,
      upsert: (k, item) =>
        setContent((c) => {
          const list = c[k] as { id: string }[]
          const exists = list.some((x) => x.id === item.id)
          return { ...c, [k]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list] }
        }),
      remove: (k, id) => setContent((c) => ({ ...c, [k]: (c[k] as { id: string }[]).filter((x) => x.id !== id) })),
      setSite: (patch) => setContent((c) => ({ ...c, site: { ...c.site, ...patch } })),
      reset: () => setContent(DEFAULTS),
      eventById: (id) => events.find((e) => e.id === id),
      showById: (id) => shows.find((s) => s.id === id),
      featured: events.find((e) => e.id === content.site.heroEventId) ?? events[0],
    }
  }, [content])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useContent() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useContent needs ContentProvider')
  return c
}
