import type { MembershipPlan, MerchItem, PastShow, Photo, UpcomingEvent, Video } from '../domain/types'

// Placeholder catalog. Swap for the CMS or API once it exists.

export const ABOUT =
  'More than an event collective, Raw Vision is a network of creators and cultural leaders working toward a common goal: crafting unforgettable live experiences that celebrate culture and community.'

export const EVENTS: UpcomingEvent[] = [
  {
    id: 'night-shift',
    title: 'Raw Sessions 08: Night Shift',
    city: 'Jakarta',
    venue: 'Gudang Sarinah Ekosistem',
    startsAt: '2026-11-21T20:00:00+07:00',
    status: 'open',
    blurb: 'Eight hours, one warehouse, no phones on the floor. Lineup drops one name a week.',
    tiers: [
      { id: 'early', name: 'Early Bird', price: 350_000, soldOut: true, note: 'First 300 tickets' },
      { id: 'ga', name: 'General Admission', price: 450_000, note: 'Entry from 20:00' },
      { id: 'floor', name: 'Floor+', price: 750_000, note: 'Front pit and fast lane' },
    ],
  },
  {
    id: 'concrete-bali',
    title: 'Concrete // Bali',
    city: 'Bali',
    venue: 'Uluwatu Cliff Stage',
    startsAt: '2026-12-13T17:00:00+08:00',
    status: 'presale',
    blurb: 'Sunset to sunrise on the cliffs. RAW members get 48 hours before the public sale.',
    tiers: [
      { id: 'ga', name: 'General Admission', price: 650_000, note: 'Sunset entry' },
      { id: 'vip', name: 'Cliffside VIP', price: 1_500_000, note: 'Deck access and hosted bar' },
    ],
  },
  {
    id: 'raw-nye',
    title: 'RAW NYE 2027',
    city: 'Jakarta',
    venue: 'Venue drops 1 December',
    startsAt: '2026-12-31T21:00:00+07:00',
    status: 'waitlist',
    blurb: 'The last night of the year with the whole collective. Join the waitlist to hear first.',
    tiers: [{ id: 'waitlist', name: 'Waitlist spot', price: 0, note: 'Free, no payment taken' }],
  },
  {
    id: 'asia-sg',
    title: 'Raw Vision Asia Tour: Singapore',
    city: 'Singapore',
    venue: 'Marina East Grounds',
    startsAt: '2027-02-14T19:00:00+08:00',
    status: 'waitlist',
    blurb: 'The first stop outside Indonesia. Kuala Lumpur and Bangkok follow.',
    tiers: [{ id: 'waitlist', name: 'Waitlist spot', price: 0, note: 'Free, no payment taken' }],
  },
]

export const SHOWS: PastShow[] = [
  { id: 'ye-live', title: 'YE Live', city: 'Jakarta', venue: 'Gelora Bung Karno Stadium', date: '2026-10-24', headcount: 'Stadium', blurb: 'The biggest night the collective has produced. One stadium, one stage in the round.', scene: 'stadium' },
  { id: 'blackout', title: 'Raw Sessions 07: Blackout', city: 'Jakarta', venue: 'Pos Bloc', date: '2026-08-15', headcount: '2,400', blurb: 'Every light in the building off for the first hour. The crowd found the stage by sound.', scene: 'crowd' },
  { id: 'warehouse-03', title: 'Warehouse 03', city: 'Bandung', venue: 'Pabrik Kina', date: '2026-05-02', headcount: '1,800', blurb: 'A disused factory, two rooms, and a sunrise set nobody planned.', scene: 'stage' },
  { id: 'sessions-06', title: 'Raw Sessions 06', city: 'Jakarta', venue: 'Gudang Sarinah Ekosistem', date: '2026-02-21', headcount: '2,100', blurb: 'The sixth session and the first to sell out in under an hour.', scene: 'stage' },
  { id: 'concrete-jungle', title: 'Concrete Jungle', city: 'Surabaya', venue: 'Lapangan Kodam', date: '2025-11-08', headcount: '3,000', blurb: 'Open air, East Java heat, and the loudest crowd of the year.', scene: 'crowd' },
  { id: 'sessions-01', title: 'Raw Sessions 01', city: 'Jakarta', venue: 'A basement in Kemang', date: '2025-03-14', headcount: '180', blurb: 'Where it started. 180 people, one speaker stack, no permit.', scene: 'portrait' },
]

export const PHOTOS: Photo[] = [
  { id: 'p01', showId: 'ye-live', caption: 'Stage in the round, from the roof', credit: 'Dimas R.', scene: 'stadium', tall: true },
  { id: 'p02', showId: 'ye-live', caption: 'Gate 7 at 18:40', credit: 'Ayu K.', scene: 'crowd' },
  { id: 'p03', showId: 'ye-live', caption: 'Soundcheck, empty seats', credit: 'Dimas R.', scene: 'stage', membersOnly: true },
  { id: 'p04', showId: 'ye-live', caption: 'The last song', credit: 'Raka S.', scene: 'crowd', tall: true },
  { id: 'p05', showId: 'blackout', caption: 'First light after the dark hour', credit: 'Ayu K.', scene: 'stage' },
  { id: 'p06', showId: 'blackout', caption: 'Crew call, 14:00', credit: 'Nadia P.', scene: 'portrait', tall: true, membersOnly: true },
  { id: 'p07', showId: 'blackout', caption: 'Front barrier', credit: 'Raka S.', scene: 'crowd' },
  { id: 'p08', showId: 'warehouse-03', caption: 'Room two at sunrise', credit: 'Nadia P.', scene: 'stage', tall: true },
  { id: 'p09', showId: 'warehouse-03', caption: 'Factory floor, before doors', credit: 'Dimas R.', scene: 'object' },
  { id: 'p10', showId: 'warehouse-03', caption: 'Backstage stairwell', credit: 'Ayu K.', scene: 'portrait', membersOnly: true },
  { id: 'p11', showId: 'sessions-06', caption: 'Sold out queue', credit: 'Raka S.', scene: 'crowd' },
  { id: 'p12', showId: 'sessions-06', caption: 'Smoke and strobes', credit: 'Nadia P.', scene: 'stage', tall: true },
  { id: 'p13', showId: 'concrete-jungle', caption: 'Heat haze over the field', credit: 'Dimas R.', scene: 'crowd', tall: true },
  { id: 'p14', showId: 'concrete-jungle', caption: 'Headliner walk-on', credit: 'Ayu K.', scene: 'portrait' },
  { id: 'p15', showId: 'concrete-jungle', caption: 'Merch tent at close', credit: 'Raka S.', scene: 'object', membersOnly: true },
  { id: 'p16', showId: 'sessions-01', caption: 'The basement, 2025', credit: 'Archive', scene: 'portrait', tall: true },
  { id: 'p17', showId: 'sessions-01', caption: 'One speaker stack', credit: 'Archive', scene: 'object' },
  { id: 'p18', showId: 'sessions-01', caption: 'Hand-drawn flyer', credit: 'Archive', scene: 'object', membersOnly: true },
]

export const VIDEOS: Video[] = [
  { id: 'v01', showId: 'ye-live', title: 'YE Live: Official Aftermovie', kind: 'Aftermovie', minutes: 6, scene: 'stadium' },
  { id: 'v02', showId: 'ye-live', title: '72 Hours Building the Stage', kind: 'Backstage', minutes: 14, scene: 'stage', membersOnly: true },
  { id: 'v03', showId: 'blackout', title: 'Blackout: The Dark Hour, Uncut', kind: 'Live set', minutes: 62, scene: 'crowd', membersOnly: true },
  { id: 'v04', showId: 'blackout', title: 'Blackout Recap', kind: 'Aftermovie', minutes: 4, scene: 'crowd' },
  { id: 'v05', showId: 'warehouse-03', title: 'Sunrise Set, Room Two', kind: 'Live set', minutes: 48, scene: 'stage' },
  { id: 'v06', showId: 'warehouse-03', title: 'Finding the Factory', kind: 'Interview', minutes: 9, scene: 'portrait' },
  { id: 'v07', showId: 'concrete-jungle', title: 'Concrete Jungle Aftermovie', kind: 'Aftermovie', minutes: 5, scene: 'crowd' },
  { id: 'v08', showId: 'sessions-01', title: 'Founders on Session 01', kind: 'Interview', minutes: 18, scene: 'portrait', membersOnly: true },
]

export const MERCH: MerchItem[] = [
  { id: 'm01', name: 'YE Live GBK Tee', category: 'Tees', price: 450_000, sizes: ['S', 'M', 'L', 'XL'], stock: 'low', scene: 'stadium' },
  { id: 'm02', name: 'Halftone Logo Tee', category: 'Tees', price: 380_000, sizes: ['S', 'M', 'L', 'XL', 'XXL'], stock: 'in', scene: 'object' },
  { id: 'm03', name: 'Crew Hoodie 26', category: 'Outerwear', price: 890_000, sizes: ['M', 'L', 'XL'], stock: 'in', scene: 'portrait' },
  { id: 'm04', name: 'Blackout Coach Jacket', category: 'Outerwear', price: 1_250_000, sizes: ['M', 'L'], stock: 'out', scene: 'crowd' },
  { id: 'm05', name: 'RVC Six Panel', category: 'Headwear', price: 320_000, sizes: ['One size'], stock: 'in', scene: 'object' },
  { id: 'm06', name: 'GBK Aerial Print, A2', category: 'Prints', price: 550_000, sizes: ['A2'], stock: 'in', scene: 'stadium' },
  { id: 'm07', name: 'Session 01 Flyer Reprint', category: 'Prints', price: 250_000, sizes: ['A3'], stock: 'low', scene: 'portrait' },
  { id: 'm08', name: 'Steel Lighter', category: 'Objects', price: 180_000, sizes: ['One size'], stock: 'in', scene: 'object' },
  { id: 'm09', name: 'RAW Members Varsity', category: 'Outerwear', price: 1_650_000, sizes: ['S', 'M', 'L', 'XL'], stock: 'low', scene: 'stage', membersOnly: true },
  { id: 'm10', name: 'RAW Numbered Tee', category: 'Tees', price: 520_000, sizes: ['S', 'M', 'L', 'XL'], stock: 'in', scene: 'crowd', membersOnly: true },
]

export const PLANS: MembershipPlan[] = [
  { id: 'circle', name: 'RAW Circle', price: 150_000, period: 'month', perks: ['48-hour presale on every event', 'Full photo and video vault', 'Members-only merch drops'] },
  { id: 'core', name: 'RAW Core', price: 1_500_000, period: 'year', perks: ['Everything in Circle', 'Guest list draw every show', 'Numbered member card and tee', 'Invites to closed sessions'] },
]

// Demo access code for the RAW gate. Real membership checks belong on the server.
export const RAW_CODE = 'RAW2026'

export const eventById = (id: string) => EVENTS.find((e) => e.id === id)
