// Placeholder ops numbers for the admin dashboard. Swap for the reporting API.
import { EVENTS, MERCH } from './catalog'

// Demo sign-in for the admin gate. The check runs in the browser, so it guards nothing;
// real auth belongs on the server.
export const DEMO_ADMIN = { email: 'ops@rawvision.test', password: 'control-room' }

export type Week = { label: string; tickets: number; merch: number; members: number }

// Revenue per week in IDR, last 12 weeks. The YE Live week (ends 25 Oct) carries the spike.
export const WEEKS: Week[] = [
  { label: '10 AUG', tickets: 182_000_000, merch: 21_000_000, members: 9_000_000 },
  { label: '17 AUG', tickets: 264_000_000, merch: 38_000_000, members: 11_000_000 },
  { label: '24 AUG', tickets: 96_000_000, merch: 14_000_000, members: 10_500_000 },
  { label: '31 AUG', tickets: 120_000_000, merch: 17_000_000, members: 12_000_000 },
  { label: '07 SEP', tickets: 410_000_000, merch: 26_000_000, members: 18_000_000 },
  { label: '14 SEP', tickets: 355_000_000, merch: 31_000_000, members: 21_000_000 },
  { label: '21 SEP', tickets: 298_000_000, merch: 29_000_000, members: 19_500_000 },
  { label: '28 SEP', tickets: 512_000_000, merch: 44_000_000, members: 26_000_000 },
  { label: '05 OCT', tickets: 640_000_000, merch: 52_000_000, members: 31_000_000 },
  { label: '12 OCT', tickets: 820_000_000, merch: 77_000_000, members: 38_000_000 },
  { label: '19 OCT', tickets: 1_140_000_000, merch: 128_000_000, members: 54_000_000 },
  { label: '26 OCT', tickets: 1_580_000_000, merch: 296_000_000, members: 71_000_000 },
]

export const weekTotal = (w: Week) => w.tickets + w.merch + w.members

export const MIX = [
  { key: 'Tickets', value: WEEKS.reduce((s, w) => s + w.tickets, 0), color: 'var(--color-fg)' },
  { key: 'Merch', value: WEEKS.reduce((s, w) => s + w.merch, 0), color: '#a6a6a6' },
  { key: 'Membership', value: WEEKS.reduce((s, w) => s + w.members, 0), color: '#6b6b6b' },
  { key: 'Sponsors', value: 450_000_000, color: 'var(--color-signal)' },
]

// Cumulative RAW members at the end of each week.
export const MEMBERS = [412, 455, 470, 498, 590, 662, 701, 808, 931, 1104, 1452, 1968]

export const SELL_THROUGH = [
  { eventId: 'night-shift', sold: 2140, capacity: 3000, label: 'Tickets sold' },
  { eventId: 'concrete-bali', sold: 610, capacity: 1800, label: 'Presale sold' },
  { eventId: 'raw-nye', sold: 4210, capacity: 5000, label: 'Waitlist' },
  { eventId: 'asia-sg', sold: 1320, capacity: 4000, label: 'Waitlist' },
]

export const STOCK = [
  { itemId: 'm01', left: 18, of: 400 },
  { itemId: 'm02', left: 212, of: 600 },
  { itemId: 'm03', left: 96, of: 250 },
  { itemId: 'm04', left: 0, of: 150 },
  { itemId: 'm06', left: 41, of: 120 },
  { itemId: 'm07', left: 9, of: 200 },
  { itemId: 'm09', left: 14, of: 100 },
]

export const BOOKING_STATUSES = ['Paid', 'Pending', 'Refunded'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type AdminBooking = {
  code: string
  name: string
  eventId: string
  tier: string
  qty: number
  total: number
  status: BookingStatus
  at: string
}

export const RECENT: AdminBooking[] = [
  { code: 'RVC-K7Q2MA', name: 'Nadia Putri', eventId: 'night-shift', tier: 'Floor+', qty: 2, total: 1_500_000, status: 'Paid', at: '2026-10-27T13:42:00+07:00' },
  { code: 'RVC-3HXW9P', name: 'Bima Santoso', eventId: 'night-shift', tier: 'General Admission', qty: 4, total: 1_800_000, status: 'Paid', at: '2026-10-27T13:20:00+07:00' },
  { code: 'RVC-Z8N4TE', name: 'Ayu Lestari', eventId: 'concrete-bali', tier: 'Cliffside VIP', qty: 2, total: 3_000_000, status: 'Pending', at: '2026-10-27T12:58:00+07:00' },
  { code: 'RVC-M2D6RV', name: 'Kevin Wijaya', eventId: 'raw-nye', tier: 'Waitlist spot', qty: 1, total: 0, status: 'Paid', at: '2026-10-27T12:31:00+07:00' },
  { code: 'RVC-P9F3LC', name: 'Sarah Tan', eventId: 'asia-sg', tier: 'Waitlist spot', qty: 2, total: 0, status: 'Paid', at: '2026-10-27T11:47:00+07:00' },
  { code: 'RVC-W4J7GB', name: 'Raka Pratama', eventId: 'night-shift', tier: 'General Admission', qty: 1, total: 450_000, status: 'Refunded', at: '2026-10-27T11:05:00+07:00' },
  { code: 'RVC-T6Y8HN', name: 'Dewi Anggraini', eventId: 'concrete-bali', tier: 'General Admission', qty: 3, total: 1_950_000, status: 'Paid', at: '2026-10-27T10:22:00+07:00' },
  { code: 'RVC-B5U2QK', name: 'Fajar Nugroho', eventId: 'night-shift', tier: 'Floor+', qty: 1, total: 750_000, status: 'Pending', at: '2026-10-27T09:40:00+07:00' },
  { code: 'RVC-C3R9XS', name: 'Intan Maharani', eventId: 'night-shift', tier: 'General Admission', qty: 2, total: 900_000, status: 'Paid', at: '2026-10-27T09:02:00+07:00' },
  { code: 'RVC-H8E4ZW', name: 'Yoga Firmansyah', eventId: 'raw-nye', tier: 'Waitlist spot', qty: 3, total: 0, status: 'Paid', at: '2026-10-27T08:15:00+07:00' },
  { code: 'RVC-L2V6PD', name: 'Clara Hutapea', eventId: 'concrete-bali', tier: 'Cliffside VIP', qty: 1, total: 1_500_000, status: 'Refunded', at: '2026-10-26T22:48:00+07:00' },
  { code: 'RVC-Q7A3NM', name: 'Dimas Rahardjo', eventId: 'night-shift', tier: 'General Admission', qty: 2, total: 900_000, status: 'Paid', at: '2026-10-26T21:10:00+07:00' },
]

// Pool the live feed cycles through to simulate incoming activity.
export const FEED_POOL = [
  'New booking · 2 × General Admission · Night Shift',
  'RAW Core member joined · #1969',
  'Merch order · Halftone Logo Tee, L',
  'Waitlist +3 · RAW NYE 2027',
  'Presale booking · Cliffside VIP · Concrete // Bali',
  'Merch order · RVC Six Panel',
  'New booking · Floor+ · Night Shift',
  'RAW Circle member joined · #1970',
]

// Seeded generator so the long tables stay identical between reloads.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const FIRST = ['Adit', 'Bella', 'Citra', 'Dani', 'Eka', 'Farah', 'Gilang', 'Hana', 'Ilham', 'Jessica', 'Kirana', 'Lukas', 'Maya', 'Nico', 'Olivia', 'Putra', 'Rani', 'Satria', 'Tasya', 'Vino']
const LAST = ['Siregar', 'Halim', 'Kusuma', 'Saputra', 'Wibowo', 'Gunawan', 'Lim', 'Hakim', 'Setiawan', 'Tanoto', 'Pane', 'Utomo']
const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeRows<T>(n: number, seed: number, row: (r: () => number, i: number, pick: <U>(xs: readonly U[]) => U, code: () => string, name: () => string) => T) {
  const r = seeded(seed)
  const pick = <U,>(xs: readonly U[]) => xs[Math.floor(r() * xs.length)]
  const code = () => Array.from({ length: 6 }, () => pick([...CODE])).join('')
  const name = () => `${pick(FIRST)} ${pick(LAST)}`
  return Array.from({ length: n }, (_, i) => row(r, i, pick, code, name))
}

const NOW = new Date('2026-10-27T13:45:00+07:00').getTime()
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString()

export const BOOKINGS: AdminBooking[] = [
  ...RECENT,
  ...makeRows<AdminBooking>(52, 7, (r, i, pick, code, name) => {
    const ev = pick(EVENTS.slice(0, 2))
    const tier = pick(ev.tiers.filter((t) => !t.soldOut))
    const qty = 1 + Math.floor(r() * 4)
    const roll = r()
    return { code: `RVC-${code()}`, name: name(), eventId: ev.id, tier: tier.name, qty, total: tier.price * qty, status: roll < 0.76 ? 'Paid' : roll < 0.9 ? 'Pending' : 'Refunded', at: minutesAgo(1400 + i * 95 + Math.floor(r() * 60)) }
  }),
]

export const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Refunded'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type Order = { code: string; name: string; items: { itemId: string; size: string }[]; total: number; status: OrderStatus; at: string; city: string }

export const ORDERS: Order[] = makeRows<Order>(46, 11, (r, i, pick, code, name) => {
  const items = Array.from({ length: 1 + Math.floor(r() * 3) }, () => {
    const m = pick(MERCH.filter((x) => x.stock !== 'out'))
    return { itemId: m.id, size: pick(m.sizes) }
  })
  const roll = r()
  return {
    code: `ORD-${code()}`,
    name: name(),
    items,
    total: items.reduce((s, it) => s + (MERCH.find((m) => m.id === it.itemId)?.price ?? 0), 0) + 25_000,
    status: i < 6 ? 'Processing' : roll < 0.08 ? 'Refunded' : roll < 0.45 ? 'Shipped' : 'Delivered',
    at: minutesAgo(20 + i * 170 + Math.floor(r() * 90)),
    city: pick(['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Medan', 'Singapore']),
  }
})

export const SHIPPING_FEE = 25_000

export type Member = { id: string; name: string; plan: 'RAW Circle' | 'RAW Core'; joined: string; city: string; status: 'Active' | 'Lapsed'; spend: number }

export const MEMBER_LIST: Member[] = makeRows<Member>(48, 23, (r, i, pick, _code, name) => {
  const plan: Member['plan'] = r() < 0.62 ? 'RAW Circle' : 'RAW Core'
  return {
    id: `RVC-${1968 - i}`,
    name: name(),
    plan,
    joined: minutesAgo(i * 1300 + Math.floor(r() * 600)),
    city: pick(['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Singapore']),
    status: r() < 0.9 ? 'Active' : 'Lapsed',
    spend: Math.round((plan === 'RAW Core' ? 1_500_000 : 150_000) + r() * 2_400_000),
  }
})

// Plan split across all members, not just the listed page.
export const PLAN_SPLIT = [
  { key: 'RAW Circle', value: 1214, color: 'var(--color-fg)' },
  { key: 'RAW Core', value: 754, color: 'var(--color-signal)' },
]

export const PAST_RESULTS: Record<string, { attendance: number; revenue: number }> = {
  'ye-live': { attendance: 61_000, revenue: 4_920_000_000 },
  blackout: { attendance: 2_400, revenue: 1_130_000_000 },
  'warehouse-03': { attendance: 1_800, revenue: 720_000_000 },
  'sessions-06': { attendance: 2_100, revenue: 890_000_000 },
  'concrete-jungle': { attendance: 3_000, revenue: 1_260_000_000 },
  'sessions-01': { attendance: 180, revenue: 9_000_000 },
}
