import { ArrowUpRight, CalendarDays, LayoutGrid, LogOut, Menu, Package, Ticket, Users, X, type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useStore } from '../../app/store'
import { formatDate } from '../../domain/rules'
import { Scramble } from '../../ui/motion'
import { useRevealObserver } from '../../ui/reveal'
import { StatusTag } from '../../ui/ui'
import { useDialog } from '../../ui/useDialog'
import AdminLogin from './AdminLogin'
import Overview from './Overview'

const TODAY = formatDate(new Date().toISOString(), { day: '2-digit', month: 'short', year: 'numeric' })

const SECTIONS: { id: string; label: string; icon: LucideIcon; group: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, group: 'Live' },
  { id: 'events', label: 'Events', icon: CalendarDays, group: 'Sales' },
  { id: 'bookings', label: 'Bookings', icon: Ticket, group: 'Sales' },
  { id: 'merch', label: 'Merch stock', icon: Package, group: 'Sales' },
  { id: 'members', label: 'Members', icon: Users, group: 'Community' },
]

function Sidebar({ active, go }: { active: string; go: (id: string) => void }) {
  const { admin, signOut, toast } = useStore()
  const groups = [...new Set(SECTIONS.map((s) => s.group))]
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <img src="/rvc-logo.png" alt="Raw Vision Collective" className="h-6 w-auto" />
        <span className="border border-line-strong px-1.5 py-0.5 text-[9px] uppercase tracking-[0.25em] text-muted">Admin</span>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {groups.map((g) => (
          <div key={g}>
            <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.3em] text-subtle">{g}</p>
            {SECTIONS.filter((s) => s.group === g).map((s) => {
              const on = s.id === active
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-current={on ? 'true' : undefined}
                  onClick={() => go(s.id)}
                  className={`relative flex h-10 w-full items-center gap-3 px-3 text-xs uppercase tracking-[0.15em] transition-colors ${on ? 'bg-raised text-fg' : 'text-muted hover:bg-raised/60 hover:text-fg'}`}
                >
                  <span className={`absolute inset-y-1.5 left-0 w-[2px] bg-signal transition-transform duration-300 ${on ? 'scale-y-100' : 'scale-y-0'}`} />
                  <s.icon className={`size-4 ${on ? 'text-signal' : ''}`} aria-hidden />
                  <Scramble text={s.label} />
                </button>
              )
            })}
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

function Console() {
  const [active, setActive] = useState('overview')
  const [drawer, setDrawer] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const drawerRef = useDialog(drawer, () => setDrawer(false))

  // Highlight the last section whose top has passed the upper part of the scroll area.
  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    const onScroll = () => {
      const edge = root.getBoundingClientRect().top + root.clientHeight * 0.3
      const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - 4
      const tops = SECTIONS.map((s) => ({ id: s.id, top: document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity })).sort((x, y) => y.top - x.top)
      // Sections sharing a row tie on top; the stable sort keeps the earlier nav entry first.
      setActive((atEnd ? tops[0] : tops.find((t) => t.top <= edge))?.id ?? 'overview')
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setDrawer(false)
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex h-dvh bg-void text-fg">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-panel lg:block">
        <Sidebar active={active} go={go} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-black/70" />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Admin menu" className="animate-rise absolute inset-y-0 left-0 w-72 border-r border-line bg-panel">
            <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="absolute right-3 top-3 z-10 grid size-10 place-items-center hover:bg-hover">
              <X className="size-5" />
            </button>
            <Sidebar active={active} go={go} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 md:px-6 lg:px-8">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="grid size-10 place-items-center hover:bg-hover lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.25em] text-subtle">Admin / {SECTIONS.find((s) => s.id === active)?.label}</p>
            <h1 className="font-display text-lg uppercase leading-tight md:text-xl">
              Control room<span className="animate-blink text-signal">_</span>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden border border-line-strong px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted sm:inline">{TODAY}</span>
            <StatusTag tone="live">Live</StatusTag>
          </div>
        </header>
        <main ref={mainRef} id="main" className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 md:px-6 lg:px-8">
          <Overview />
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
