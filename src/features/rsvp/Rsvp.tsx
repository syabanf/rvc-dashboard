import { Check, Minus, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { useStore } from '../../app/store'
import { useContent } from '../../app/content'
import { bookingTotal, formatDate, formatIDR, isEmail, makeCode } from '../../domain/rules'
import type { Booking } from '../../domain/types'
import { btn, Field, inputCls, PageHead } from '../../ui/ui'

const MAX_QTY = 6

export default function Rsvp() {
  const { events: EVENTS, eventById, featured } = useContent()
  const { member, bookings, addBooking, toast } = useStore()
  const [params, setParams] = useSearchParams()
  const { key } = useLocation()
  const event = eventById(params.get('event') ?? '') ?? featured
  const firstTier = event.tiers.find((t) => !t.soldOut) ?? event.tiers[0]
  const [tierId, setTierId] = useState(firstTier.id)
  const tier = event.tiers.find((t) => t.id === tierId && !t.soldOut) ?? firstTier
  const [qty, setQty] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  // Tied to the location key so any later navigation lands on a fresh form.
  const [confirmed, setConfirmed] = useState<{ booking: Booking; key: string } | null>(null)
  const done = confirmed?.key === key ? confirmed.booking : null
  const locked = event.status === 'presale' && !member
  const total = bookingTotal(tier, qty)

  const pickEvent = (id: string) => {
    setParams({ event: id }, { replace: true })
    const e = eventById(id)
    setTierId((e?.tiers.find((t) => !t.soldOut) ?? e?.tiers[0])?.id ?? '')
    setQty(1)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = 'Enter the name on your ID'
    if (!isEmail(form.email)) next.email = 'Enter a valid email'
    if (form.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter a phone number with at least 9 digits'
    setErrors(next)
    if (Object.keys(next).length) return toast('Check the form', 'Some fields need fixing before we can book.')
    const booking: Booking = { code: makeCode('RVC'), eventId: event.id, tierId: tier.id, qty, name: form.name.trim(), email: form.email.trim(), total, createdAt: new Date().toISOString() }
    addBooking(booking)
    setConfirmed({ booking, key })
    toast('Booking confirmed', `${booking.code}. Saved on this device; email delivery starts when the backend is live.`)
  }

  if (done) {
    const ev = eventById(done.eventId)!
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="animate-rise border border-fg p-6 md:p-10">
          <span className="mb-8 grid size-12 place-items-center bg-fg text-void">
            <Check className="size-6" />
          </span>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">You're in</p>
          <h1 className="font-display text-4xl uppercase leading-none md:text-6xl">{ev.title}</h1>
          <dl className="mt-10 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            {[
              ['Booking code', done.code],
              ['Date', formatDate(ev.startsAt)],
              ['Ticket', `${done.qty} × ${ev.tiers.find((t) => t.id === done.tierId)?.name}`],
              ['Total', done.total ? formatIDR(done.total) : 'Free'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.25em] text-muted">{k}</dt>
                <dd className="font-mono text-lg uppercase">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/events" className={btn('solid')}>
              More events
            </Link>
            <button type="button" className={btn('line')} onClick={() => setConfirmed(null)}>
              Book another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="06" kicker="Booking" title={'RSVP /\nBooking'}>
        Pick a night, pick a ticket, done. Names on tickets must match your ID at the door.
      </PageHead>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-10">
          <fieldset>
            <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">01 · Event</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {EVENTS.map((e) => (
                <label key={e.id} className={`cursor-pointer border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fg ${e.id === event.id ? 'border-fg bg-raised' : 'border-line-strong hover:border-muted'}`}>
                  <input type="radio" name="event" value={e.id} checked={e.id === event.id} onChange={() => pickEvent(e.id)} className="sr-only" />
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-muted tabular">{formatDate(e.startsAt, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="mt-1 block text-sm font-bold uppercase">{e.title}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.15em] text-subtle">{e.city}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={locked} className="disabled:opacity-40">
            <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">02 · Ticket</legend>
            <div className="space-y-2">
              {event.tiers.map((t) => (
                <label key={t.id} className={`flex cursor-pointer items-center justify-between gap-4 border p-4 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fg ${t.id === tier.id ? 'border-fg bg-raised' : 'border-line-strong hover:border-muted'}`}>
                  <input type="radio" name="tier" value={t.id} checked={t.id === tier.id} disabled={t.soldOut} onChange={() => setTierId(t.id)} className="sr-only" />
                  <span>
                    <span className="block text-sm font-bold uppercase">
                      {t.name} {t.soldOut && <span className="ml-2 text-[10px] text-signal">Sold out</span>}
                    </span>
                    <span className="mt-1 block text-xs text-muted">{t.note}</span>
                  </span>
                  <span className="text-sm tabular">{t.price ? formatIDR(t.price) : 'Free'}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border border-line-strong p-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">Quantity</span>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="One less ticket" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="grid size-10 place-items-center border border-line-strong hover:bg-hover disabled:opacity-30">
                  <Minus className="size-4" />
                </button>
                <output aria-live="polite" className="w-10 text-center text-lg tabular">{qty}</output>
                <button type="button" aria-label="One more ticket" disabled={qty >= MAX_QTY} onClick={() => setQty(qty + 1)} className="grid size-10 place-items-center border border-line-strong hover:bg-hover disabled:opacity-30">
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </fieldset>

          <fieldset disabled={locked} className="space-y-5 disabled:opacity-40">
            <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">03 · Your details</legend>
            <Field label="Full name" error={errors.name}>
              <input className={inputCls} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" error={errors.email}>
                <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
              </Field>
              <Field label="Phone / WhatsApp" error={errors.phone}>
                <input className={inputCls} type="tel" autoComplete="tel" placeholder="+62" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} aria-invalid={!!errors.phone} />
              </Field>
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line bg-panel p-5 md:p-6">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">Summary</p>
            <p className="font-display text-2xl uppercase leading-tight">{event.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-body">
              {formatDate(event.startsAt)} · {event.city}
            </p>
            <div className="my-6 space-y-2 border-y border-line py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">
                  {qty} × {tier.name}
                </span>
                <span className="tabular">{formatIDR(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Service fee</span>
                <span>Included</span>
              </div>
            </div>
            <div className="mb-6 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">Total</span>
              <span className="font-display text-3xl tabular">{total ? formatIDR(total) : 'Free'}</span>
            </div>
            {locked ? (
              <Link to="/raw" className={btn('solid', 'w-full')}>
                Presale is for RAW members
              </Link>
            ) : (
              <button type="submit" className={btn('solid', 'w-full')}>
                {event.status === 'waitlist' ? 'Join waitlist' : 'Confirm booking'}
              </button>
            )}
          </div>

          {bookings.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">Your bookings</p>
              <ul className="divide-y divide-line border-y border-line">
                {bookings.slice(0, 5).map((b) => (
                  <li key={b.code} className="flex items-center justify-between gap-3 py-3 text-xs">
                    <span className="font-bold">{b.code}</span>
                    <span className="truncate uppercase text-muted">{eventById(b.eventId)?.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </form>
    </div>
  )
}
