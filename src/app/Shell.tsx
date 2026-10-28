import { ArrowUpRight, Asterisk, Lock, Menu, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { cartTotal, formatIDR, isEmail } from '../domain/rules'
import { btn, Halftone, inputCls } from '../ui/ui'
import { Scramble } from '../ui/motion'
import { Cursor } from '../ui/fx'
import { BOOT_MS, Preloader, TapeTransition } from '../ui/tape'
import { useRevealObserver } from '../ui/reveal'
import { useDialog } from '../ui/useDialog'
import { Media } from '../ui/Media'
import { BracketThumb, itemCode, Specs } from '../ui/scene'
import { useContent } from './content'
import { useStore } from './store'

const NAV = [
  { to: '/photos', label: 'Photos', n: '01' },
  { to: '/videos', label: 'Videos', n: '02' },
  { to: '/merch', label: 'Merch', n: '03' },
  { to: '/shows', label: 'Past Shows', n: '04' },
  { to: '/events', label: 'Events', n: '05' },
  { to: '/rsvp', label: 'RSVP', n: '06' },
  { to: '/raw', label: 'RAW', n: '07' },
]

function CartDrawer() {
  const { merch: MERCH } = useContent()
  const { cart, cartOpen, setCartOpen, setQty, toast } = useStore()
  const close = () => setCartOpen(false)
  const ref = useDialog(cartOpen, close)
  if (!cartOpen) return null
  const count = cart.reduce((n, l) => n + l.qty, 0)
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close bag" onClick={close} className="absolute inset-0 bg-black/70" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Your cart" className="animate-rise absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-void">
        <div className="border-b border-fg px-5 pb-6 pt-5 md:px-8">
          <div className="flex justify-end">
            <button type="button" onClick={close} aria-label="Close bag" className="grid size-10 place-items-center rounded-full border border-fg hover:bg-fg hover:text-void">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-5xl uppercase leading-none tracking-[-0.03em] md:text-6xl">Your cart</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em]">Originals from Raw Vision Collective</p>
            </div>
            <p className="flex items-center gap-2 font-display text-2xl tabular md:text-3xl">
              [{String(count).padStart(2, '0')}] <Asterisk className="size-8 animate-[spin-slow_8s_linear_infinite]" aria-hidden />
            </p>
          </div>
        </div>
        <ol className="flex-1 overflow-y-auto">
          {cart.length === 0 && <li className="px-5 py-16 text-center text-sm uppercase tracking-[0.2em] text-muted">Your cart is empty.</li>}
          {cart.map((l, i) => {
            const item = MERCH.find((m) => m.id === l.itemId)
            if (!item) return null
            return (
              <li key={`${l.itemId}-${l.size}`} style={{ animationDelay: `${i * 60}ms` }} className={`animate-rise grid grid-cols-[1.5rem_3.5rem_1fr_auto] items-center gap-3 border-b border-fg px-5 py-4 md:grid-cols-[2rem_4.5rem_1fr_auto_auto] md:gap-5 md:px-8 ${i % 2 ? 'bg-fg text-void' : ''}`}>
                <span className="self-start text-sm tabular">{String(i + 1).padStart(2, '0')}</span>
                <BracketThumb className="size-14 md:size-[4.5rem]">
                  <Media image={item.image} seed={item.id} scene={item.scene} label={item.name} ripple={false} />
                </BracketThumb>
                <div className="min-w-0">
                  <p className="flex items-start gap-1.5 font-display text-lg uppercase leading-none md:text-2xl">
                    <span className="min-w-0 truncate">{item.name}</span>
                    <sup className="mt-1 shrink-0 text-[10px]">{itemCode(item)}</sup>
                  </p>
                  <Specs className="mt-2" specs={[['Size', l.size], ['Style', item.category], ['Each', formatIDR(item.price)]]} />
                </div>
                <div className="col-span-2 col-start-3 flex items-center justify-between gap-4 md:col-span-2 md:col-start-auto md:justify-end">
                  <div className="flex items-center rounded-full border border-current">
                    <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQty(l.itemId, l.size, l.qty - 1)} className="grid size-8 place-items-center rounded-full hover:bg-signal hover:text-fg">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular">{l.qty}</span>
                    <button type="button" aria-label={`Add one ${item.name}`} onClick={() => setQty(l.itemId, l.size, l.qty + 1)} className="grid size-8 place-items-center rounded-full hover:bg-signal hover:text-fg">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="min-w-28 text-right text-base tabular md:text-lg">{formatIDR(item.price * l.qty)}</span>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="grid gap-5 bg-fg p-5 text-void md:grid-cols-[1fr_auto] md:items-end md:p-8">
          <p className="max-w-sm text-xs uppercase leading-snug text-void/70">Complete your order and take a piece of the night home. Every drop is one run, no restocks.</p>
          <div className="space-y-3 md:text-right">
            <p className="flex justify-between gap-6 text-sm uppercase tracking-wider md:justify-end">
              <span className="text-void/60">Subtotal</span>
              <span className="font-bold tabular">{formatIDR(cartTotal(cart, MERCH))}</span>
            </p>
            <button type="button" disabled={!cart.length} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-signal px-8 text-sm font-bold uppercase text-fg transition-transform hover:scale-[1.03] disabled:opacity-40 md:w-auto" onClick={() => toast('Checkout not connected', 'Payments go live with the store backend. Your bag stays saved on this device.')}>
              Checkout <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  const ref = useDialog(open, close)
  if (!open) return null
  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col bg-void lg:hidden">
      <div className="flex h-16 items-center justify-between border-b border-line px-4">
        <img src="/rvc-logo.png" alt="Raw Vision Collective" className="invert h-6 w-auto" />
        <button type="button" onClick={close} aria-label="Close menu" className="grid size-10 place-items-center">
          <X className="size-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {[{ to: '/', label: 'Home', n: '00' }, ...NAV].map((i) => (
          <NavLink key={i.to} to={i.to} end onClick={close} className={({ isActive }) => `flex items-baseline gap-4 border-b border-line py-4 ${isActive ? 'text-fg' : 'text-muted'}`}>
            <span className="text-xs">{i.n}</span>
            <span className="font-display text-3xl uppercase">{i.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function Footer() {
  const { toast } = useStore()
  const [email, setEmail] = useState('')
  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!isEmail(email)) return toast('Enter a valid email')
    setEmail('')
    toast('You are on the list', 'Mailing starts once the backend is live, so nothing was sent yet.')
  }
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-12 md:grid-cols-[minmax(0,26rem)_1fr] md:px-8 md:py-16">
        <form onSubmit={subscribe} className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Hear it first</p>
          <p className="text-sm leading-relaxed text-body">Lineups, drops and secret shows. One email when it matters.</p>
          <div className="flex">
            <input type="email" aria-label="Email address" placeholder="you@email.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            <button type="submit" className={btn('solid', 'h-12 shrink-0')}>
              Join
            </button>
          </div>
        </form>
        <nav aria-label="Footer" className="grid grid-cols-2 content-start gap-x-12 gap-y-3 text-xs uppercase tracking-[0.2em] sm:grid-cols-3 md:justify-self-end">
          {NAV.map((i) => (
            <Link key={i.to} to={i.to} className="text-muted transition-colors hover:text-fg">
              <Scramble text={i.label} />
            </Link>
          ))}
        </nav>
      </div>
      <div className="overflow-hidden px-4 md:px-8">
        <Halftone as="p" lines={['Raw Vision', 'Collective']} className="mx-auto max-w-[1440px] text-[12.4vw] [--ht-dot:4px] md:[--ht-dot:7px] 2xl:text-[11rem]" />
      </div>
      <p className="mx-4 flex justify-between border-t border-line py-5 text-[10px] uppercase tracking-[0.3em] text-subtle md:mx-8">
        <span>© 2026 Raw Vision Collective</span>
        <Link to="/admin" className="hover:text-fg">
          Admin
        </Link>
      </p>
    </footer>
  )
}

export function Shell() {
  const { cart, setCartOpen, member } = useStore()
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  const count = cart.reduce((n, l) => n + l.qty, 0)
  const currentPage = NAV.find((item) => item.to === pathname)?.label ?? (pathname === '/' ? 'Home' : pathname.startsWith('/shows/') ? 'Past Shows' : '')

  useRevealObserver()
  // On the first visit the stripe wipe doubles as the preloader exit, so it waits for the boot screen.
  const [bootDelay, setBootDelay] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0
      return sessionStorage.getItem('rvc.booted') ? 0 : BOOT_MS - 250
    } catch {
      return 0
    }
  })
  useEffect(() => {
    const t = setTimeout(() => setBootDelay(0), BOOT_MS + 1500)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh bg-void">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-fg focus:px-4 focus:py-2 focus:text-void">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 md:px-8">
          <Link to="/" aria-label="Raw Vision Collective, home" className="shrink-0">
            <img src="/rvc-logo.png" alt="" className="invert h-8 w-auto md:h-9" />
          </Link>
          <span className="hidden border-l border-line-strong pl-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted sm:block lg:hidden">{currentPage}</span>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) => `relative flex h-10 items-center gap-1.5 px-3 text-xs uppercase tracking-[0.18em] transition-colors ${isActive ? 'text-fg after:absolute after:inset-x-3 after:bottom-1 after:h-px after:bg-fg' : 'text-muted hover:text-fg'}`}
              >
                {i.to === '/raw' && <Lock className="size-3" aria-hidden />}
                <Scramble text={i.label} />
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            {member && <span className="mr-2 hidden border border-line-strong px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-muted sm:inline">{member.split(' ')[0]}</span>}
            <button type="button" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${count} items`} className="relative grid size-10 place-items-center hover:bg-hover">
              <ShoppingBag className="size-5" />
              {count > 0 && <span className="absolute right-1 top-1 grid min-w-4 place-items-center bg-fg px-1 text-[10px] font-bold text-void tabular">{count}</span>}
            </button>
            <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" className="grid size-10 place-items-center hover:bg-hover lg:hidden">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
        <div aria-hidden className="scroll-progress absolute inset-x-0 bottom-0 h-[2px] bg-signal" />
      </header>
      <MobileMenu open={menu} close={() => setMenu(false)} />
      <CartDrawer />
      {/* Keyed by path: each route change replays the tape wipe and the page rise. */}
      <TapeTransition key={`fx-${pathname}`} delay={bootDelay} />
      <Preloader />
      <Cursor />
      <main id="main" key={pathname} className="animate-page bg-void">
        <Suspense
          fallback={
            <div role="status" aria-label="Loading" className="grid h-[60vh] place-items-center">
              <Halftone as="p" lines={['RVC']} className="animate-pulse text-7xl [--ht-dot:5px]" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      {pathname !== '/photos' && pathname !== '/videos' && <Footer />}
    </div>
  )
}
