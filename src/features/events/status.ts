import type { UpcomingEvent } from '../../domain/types'

export const STATUS: Record<UpcomingEvent['status'], { tag: string; tone: 'live' | 'muted' | 'solid'; cta: string }> = {
  open: { tag: 'Tickets on sale', tone: 'live', cta: 'Book tickets' },
  presale: { tag: 'RAW presale', tone: 'solid', cta: 'Book presale' },
  waitlist: { tag: 'Waitlist', tone: 'muted', cta: 'Join waitlist' },
}
