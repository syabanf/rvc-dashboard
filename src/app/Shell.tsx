import { Lock, Menu, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { cartTotal, formatIDR, isEmail } from '../domain/rules'
import { btn, Halftone, inputCls } from '../ui/ui'
import { Scramble } from '../ui/motion'
import { Cursor } from '../ui/fx'
import { BOOT_MS, Preloader, TapeTransition } from '../ui/tape'
import { useRevealObserver } from '../ui/reveal'
import { useDialog } from '../ui/useDialog'
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
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close bag" onClick={close} className="absolute inset-0 bg-black/70" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Your bag" className="animate-rise absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-panel">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em]">Bag ({cart.reduce((n, l) => n + l.qty, 0)})</p>
          <button type="button" onClick={close} aria-label="Close bag" className="grid size-10 place-items-center hover:bg-hover">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-px overflow-y-auto">
          {cart.length === 0 && <p className="px-5 py-16 text-center text-sm text-muted">Your bag is empty.</p>}
          {cart.map((l) => {
            const item = MERCH.find((m) => m.id === l.itemId)
            if (!item) return null
            return (
              <div key={`${l.itemId}-${l.size}`} className="flex items-center gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold uppercase">{item.name}</p>
                  <p className="text-xs text-muted">
                    {l.size} · {formatIDR(item.price)}
                  </p>
                </div>
                <div className="flex items-center border border-line-strong">
                  <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQty(l.itemId, l.size, l.qty - 1)} className="grid size-9 place-items-center hover:bg-hover">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm tabular">{l.qty}</span>
                  <button type="button" aria-label={`Add one ${item.name}`} onClick={() => setQty(l.itemId, l.size, l.qty + 1)} className="grid size-9 place-items-center hover:bg-hover">
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="space-y-4 border-t border-line p-5">
          <div className="flex justify-between text-sm uppercase tracking-wider">
            <span className="text-muted">Subtotal</span>
            <span className="font-bold tabular">{formatIDR(cartTotal(cart, MERCH))}</span>
          </div>
          <button type="button" disabled={!cart.length} className={btn('solid', 'w-full')} onClick={() => toast('Checkout not connected', 'Payments go live with the store backend. Your bag stays saved on this device.')}>
            Checkout
          </button>
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

  useRevealObserver()
  // On the first visit the stripe wipe doubles as the preloader exit, so it waits for the boot screen.
  const [bootDelay, setBootDelay] = useState(() => {
    try {
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
            <img src="/rvc-logo.png" alt="" className="invert h-6 w-auto md:h-7" />
          </Link>
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
      <Footer />
    </div>
  )
}
