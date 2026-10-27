import { ArrowUpRight, Bell, CalendarDays, LayoutGrid, LogOut, Menu, Package, Search, Ticket, Users, X, type LucideIcon } from 'lucide-react'
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useStore } from '../../app/store'
import { BOOKINGS, ORDERS, SELL_THROUGH, STOCK } from '../../data/admin'
import { eventById, MERCH } from '../../data/catalog'
import { formatDate } from '../../domain/rules'
import { Scramble } from '../../ui/motion'
import { useRevealObserver } from '../../ui/reveal'
import { StatusTag } from '../../ui/ui'
import { useDialog } from '../../ui/useDialog'
import AdminLogin from './AdminLogin'

const TODAY = formatDate(new Date().toISOString(), { day: '2-digit', month: 'short', year: 'numeric' })
const PENDING = BOOKINGS.filter((b) => b.status === 'Pending').length
const LOW_STOCK = STOCK.filter((s) => s.left / s.of < 0.1)
const PROCESSING = ORDERS.filter((o) => o.status === 'Processing').length

const NAV: { to: string; label: string; icon: LucideIcon; group: string; badge?: number }[] = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, group: 'Live' },
  { to: '/admin/events', label: 'Events', icon: CalendarDays, group: 'Sales' },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket, group: 'Sales', badge: PENDING },
  { to: '/admin/merch', label: 'Merch', icon: Package, group: 'Sales', badge: LOW_STOCK.length },
  { to: '/admin/members', label: 'Members', icon: Users, group: 'Community' },
]

const ALERTS = [
  ...LOW_STOCK.map((s) => ({ to: '/admin/merch', title: `${MERCH.find((m) => m.id === s.itemId)?.name}`, body: s.left ? `${s.left} units left` : 'Sold out', urgent: true })),
  { to: '/admin/bookings?status=Pending', title: `${PENDING} bookings pending`, body: 'Payment not confirmed yet', urgent: false },
  { to: '/admin/merch?status=Processing', title: `${PROCESSING} orders to pack`, body: 'Waiting in Processing', urgent: false },
  ...SELL_THROUGH.filter((s) => s.sold / s.capacity > 0.7).map((s) => ({ to: '/admin/events', title: `${eventById(s.eventId)?.title}`, body: `${Math.round((s.sold / s.capacity) * 100)}% sold`, urgent: false })),
]

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, signOut, toast } = useStore()
  const groups = [...new Set(NAV.map((s) => s.group))]
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
        <img src="/rvc-logo.png" alt="Raw Vision Collective" className="h-6 w-auto" />
        <span className="border border-line-strong px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-muted">Admin</span>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {groups.map((g) => (
          <div key={g}>
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.3em] text-subtle">{g}</p>
            {NAV.filter((s) => s.group === g).map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                end
                onClick={onNavigate}
                className={({ isActive }) => `relative flex h-10 items-center gap-3 px-3 text-xs uppercase tracking-[0.15em] transition-colors ${isActive ? 'bg-raised text-fg' : 'text-muted hover:bg-raised/60 hover:text-fg'}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`absolute inset-y-1.5 left-0 w-[2px] bg-signal transition-transform duration-300 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
                    <s.icon className={`size-4 ${isActive ? 'text-signal' : ''}`} aria-hidden />
                    <span className="flex-1">
                      <Scramble text={s.label} />
                    </span>
                    {!!s.badge && <span className="min-w-5 bg-signal px-1.5 py-0.5 text-center text-[10px] font-bold text-white tabular">{s.badge}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <Link to="/" className="flex h-10 items-center justify-between px-3 text-xs uppercase tracking-[0.15em] text-muted hover:bg-raised hover:text-fg">
          View site <ArrowUpRight className="size-4" />
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="grid size-8 shrink-0 place-items-center bg-fg text-[11px] font-bold text-void">OT</span>
          <span className="min-w-0 flex-1 text-xs">
            <span className="block truncate font-bold uppercase">Ops team</span>
            <span className="block truncate text-muted">{admin}</span>
          </span>
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => {
              signOut()
              toast('Signed out', 'The control room is locked on this device.')
            }}
            className="grid size-9 shrink-0 place-items-center text-muted hover:bg-hover hover:text-fg"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Alerts() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={`Alerts, ${ALERTS.length}`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative grid size-10 place-items-center border border-line-strong hover:border-fg">
        <Bell className="size-4" />
        <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center bg-signal px-1 text-[9px] font-bold text-white tabular">{ALERTS.length}</span>
      </button>
      {open && (
        <div className="animate-rise absolute right-0 top-12 z-40 w-[min(22rem,calc(100vw-2rem))] border border-line-strong bg-panel shadow-2xl">
          <p className="border-b border-line px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-muted">Needs attention</p>
          <ul className="max-h-80 overflow-y-auto">
            {ALERTS.map((a) => (
              <li key={a.title}>
                <Link to={a.to} onClick={() => setOpen(false)} className="flex gap-3 border-b border-line px-4 py-3 text-xs hover:bg-raised">
                  <span className={`mt-1 size-1.5 shrink-0 rounded-full ${a.urgent ? 'bg-signal' : 'bg-muted'}`} />
                  <span className="min-w-0">
                    <span className="block truncate font-bold uppercase">{a.title}</span>
                    <span className="text-muted">{a.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Console() {
  const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState('')
  const drawerRef = useDialog(drawer, () => setDrawer(false))
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const page = NAV.find((n) => n.to === pathname) ?? NAV[0]
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  const search = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/admin/bookings${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
    setQ('')
  }

  return (
    <div className="flex h-dvh bg-void text-fg">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-panel lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/70" />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Admin menu" className="animate-rise absolute inset-y-0 left-0 w-72 border-r border-line bg-panel">
            <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute right-3 top-3 z-10 grid size-10 place-items-center hover:bg-hover">
              <X className="size-5" />
            </button>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 md:px-6">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="grid size-10 place-items-center hover:bg-hover lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.25em] text-subtle">Admin / {page.label}</p>
            <h1 className="truncate font-display text-base uppercase leading-tight md:text-lg">
              Control room<span className="animate-blink text-signal">_</span>
            </h1>
          </div>
          <form onSubmit={search} role="search" className="relative ml-auto hidden w-72 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings by name or code" placeholder="Search bookings, press Enter" className="h-10 w-full border border-line-strong bg-panel pl-9 pr-3 text-xs placeholder:text-subtle focus:border-fg focus:outline-none" />
          </form>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="hidden border border-line-strong px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] text-muted xl:inline">{TODAY}</span>
            <Alerts key={pathname} />
            <span className="hidden sm:inline-flex">
              <StatusTag tone="live">Live</StatusTag>
            </span>
          </div>
        </header>
        <main ref={mainRef} id="main" className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 md:px-6">
          <div key={pathname} className="animate-page mx-auto max-w-[1480px] space-y-4">
            <Suspense fallback={<div className="h-[60vh]" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminRoute() {
  const { admin } = useStore()
  useRevealObserver()
  return admin ? <Console /> : <AdminLogin />
}
