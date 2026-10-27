import { ArrowUpRight, KeyRound, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useStore } from '../../app/store'
import { EVENTS, MERCH, PHOTOS, PLANS, RAW_CODE, VIDEOS } from '../../data/catalog'
import { formatDate, formatIDR, isEmail } from '../../domain/rules'
import { btn, Field, Halftone, inputCls } from '../../ui/ui'

function Gate() {
  const { join, toast } = useStore()
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [plan, setPlan] = useState(PLANS[1].id)
  const [form, setForm] = useState({ name: '', email: '', handle: '' })
  const [error, setError] = useState('')

  const tryCode = (e: FormEvent) => {
    e.preventDefault()
    if (code.trim().toUpperCase() !== RAW_CODE) return setCodeError('Wrong code. Ask whoever sent you.')
    join('')
    toast('Access granted', 'Welcome inside.')
  }

  const apply = (e: FormEvent) => {
    e.preventDefault()
    if (form.name.trim().length < 2 || !isEmail(form.email)) return setError('Add your name and a valid email.')
    join(form.name.trim().split(' ')[0])
    toast('Application received', 'Payments are not connected yet, so this demo build unlocks RAW right away.')
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-black">
        <div className="mx-auto grid min-h-[78vh] max-w-[1440px] content-between gap-12 px-4 py-12 md:px-8 md:py-16">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
            <Lock className="size-3.5" /> 07 / Restricted
          </p>
          <Halftone lines={['RAW']} className="text-[clamp(8rem,34vw,30rem)] [--ht-dot:6px] md:[--ht-dot:10px]" />
          <div className="grid gap-10 md:grid-cols-2 md:items-end">
            <p className="max-w-md text-sm leading-relaxed text-body">
              You found the door. Behind it: presale before anyone, every frame we never posted, full sets, and merch that never reaches the shop.
            </p>
            <form onSubmit={tryCode} className="w-full md:justify-self-end md:max-w-md">
              <Field label="Have a code?" error={codeError}>
                <div className="flex">
                  <input className={`${inputCls} uppercase tracking-[0.3em]`} value={code} onChange={(e) => (setCode(e.target.value), setCodeError(''))} placeholder="••••••" autoComplete="off" aria-invalid={!!codeError} />
                  <button type="submit" aria-label="Enter code" className="grid w-14 shrink-0 place-items-center bg-fg text-void hover:bg-white">
                    <KeyRound className="size-5" />
                  </button>
                </div>
              </Field>
            </form>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <section data-reveal aria-labelledby="perks" className="grid gap-px border-b border-line bg-line py-px sm:grid-cols-3">
          <h2 id="perks" className="sr-only">What's inside</h2>
          {[
            [`${PHOTOS.filter((p) => p.membersOnly).length + VIDEOS.filter((v) => v.membersOnly).length}`, 'Locked photos and videos'],
            ['48h', 'Presale on every event'],
            [`${MERCH.filter((m) => m.membersOnly).length}`, 'Members-only merch drops'],
          ].map(([n, l]) => (
            <div key={l} className="bg-void py-10 sm:px-6">
              <p className="font-display text-6xl tabular">{n}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{l}</p>
            </div>
          ))}
        </section>

        <form onSubmit={apply} data-reveal className="grid gap-10 py-16 lg:grid-cols-2">
          <fieldset>
            <legend className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">Choose a membership</legend>
            <div className="grid gap-3">
              {PLANS.map((p) => (
                <label key={p.id} className={`cursor-pointer border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-fg ${plan === p.id ? 'border-fg bg-fg text-void' : 'border-line-strong hover:border-muted'}`}>
                  <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-2xl uppercase">{p.name}</span>
                    <span className="text-sm tabular">
                      {formatIDR(p.price)} / {p.period}
                    </span>
                  </span>
                  <ul className={`mt-4 space-y-1.5 text-xs ${plan === p.id ? 'text-void/75' : 'text-muted'}`}>
                    {p.perks.map((perk) => (
                      <li key={perk}>+ {perk}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-5">
            <legend className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">Apply</legend>
            <Field label="Full name">
              <input className={inputCls} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Instagram (optional)">
              <input className={inputCls} placeholder="@" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} />
            </Field>
            {error && <p className="text-xs text-signal">{error}</p>}
            <button type="submit" className={btn('solid', 'w-full')}>
              Apply for {PLANS.find((p) => p.id === plan)?.name}
            </button>
          </fieldset>
        </form>
      </div>
    </>
  )
}

function Vault() {
  const { member, leave, toast } = useStore()
  const [id, name] = [member!.split(' ')[0], member!.split(' ').slice(1).join(' ')]
  const presale = EVENTS.filter((e) => e.status !== 'waitlist')
  const rooms = [
    { to: '/photos', n: PHOTOS.filter((p) => p.membersOnly).length, label: 'Unlocked photos' },
    { to: '/videos', n: VIDEOS.filter((v) => v.membersOnly).length, label: 'Unlocked videos' },
    { to: '/merch', n: MERCH.filter((m) => m.membersOnly).length, label: 'Members drops' },
  ]

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <header className="grid gap-10 border-b border-line py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">07 / The vault</p>
          <Halftone lines={['Inside', 'RAW']} className="text-[clamp(3.5rem,11vw,9rem)] [--ht-dot:7px]" />
        </div>
        <div className="relative aspect-[1.6] w-full max-w-sm overflow-hidden border border-line-strong bg-gradient-to-br from-raised to-black p-5 sm:w-80">
          <img src="/rvc-logo.png" alt="" className="h-6 w-auto opacity-90" />
          <p className="absolute bottom-5 left-5 text-[10px] uppercase tracking-[0.25em] text-muted">
            Member{name && <span className="block text-sm text-fg">{name}</span>}
          </p>
          <p className="absolute bottom-5 right-5 font-mono text-lg tracking-[0.15em]">{id}</p>
        </div>
      </header>

      <section data-reveal aria-labelledby="rooms" className="py-12">
        <h2 id="rooms" className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">Now open to you</h2>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          {rooms.map((r) => (
            <Link key={r.to} to={r.to} className="group flex items-end justify-between bg-void p-6 hover:bg-panel">
              <span>
                <span className="block font-display text-6xl tabular">{r.n}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted">{r.label}</span>
              </span>
              <ArrowUpRight className="size-6 text-muted group-hover:text-fg" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section data-reveal aria-labelledby="presale" className="py-6">
        <h2 id="presale" className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">Presale access</h2>
        <ul className="divide-y divide-line border-y border-line">
          {presale.map((e) => (
            <li key={e.id} className="grid gap-3 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
              <span className="text-xs text-muted tabular">{formatDate(e.startsAt, { day: '2-digit', month: 'short' })}</span>
              <span className="text-sm font-bold uppercase">{e.title}</span>
              <Link to={`/rsvp?event=${e.id}`} className={btn('line', 'h-9')}>
                Book early
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className={btn('ghost', 'mt-10 px-0')}
        onClick={() => {
          leave()
          toast('Signed out of RAW', 'The vault locks again on this device.')
        }}
      >
        Leave the vault
      </button>
    </div>
  )
}

export default function Raw() {
  const { member } = useStore()
  return member ? <Vault /> : <Gate />
}
