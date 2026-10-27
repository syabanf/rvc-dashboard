export type Scene = 'stage' | 'crowd' | 'stadium' | 'portrait' | 'object'

export type Tier = { id: string; name: string; price: number; soldOut?: boolean; note: string }

export type UpcomingEvent = {
  id: string
  title: string
  city: string
  venue: string
  startsAt: string
  status: 'open' | 'presale' | 'waitlist'
  blurb: string
  tiers: Tier[]
}

export type PastShow = {
  id: string
  title: string
  city: string
  venue: string
  date: string
  headcount: string
  blurb: string
  scene: Scene
}

export type Photo = {
  id: string
  showId: string
  caption: string
  credit: string
  scene: Scene
  tall?: boolean
  membersOnly?: boolean
}

export const VIDEO_KINDS = ['Aftermovie', 'Live set', 'Backstage', 'Interview'] as const
export type VideoKind = (typeof VIDEO_KINDS)[number]

export type Video = {
  id: string
  showId: string
  title: string
  kind: VideoKind
  minutes: number
  scene: Scene
  membersOnly?: boolean
}

export const MERCH_CATEGORIES = ['Tees', 'Outerwear', 'Headwear', 'Prints', 'Objects'] as const
export type MerchCategory = (typeof MERCH_CATEGORIES)[number]

export type MerchItem = {
  id: string
  name: string
  category: MerchCategory
  price: number
  sizes: string[]
  stock: 'in' | 'low' | 'out'
  scene: Scene
  membersOnly?: boolean
}

export type MembershipPlan = { id: string; name: string; price: number; period: string; perks: string[] }

export type CartLine = { itemId: string; size: string; qty: number }

export type Booking = {
  code: string
  eventId: string
  tierId: string
  qty: number
  name: string
  email: string
  total: number
  createdAt: string
}
