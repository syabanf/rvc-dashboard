// Placeholder ops numbers for the admin dashboard. Swap for the reporting API.

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
