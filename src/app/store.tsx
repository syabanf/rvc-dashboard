import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Booking, CartLine } from '../domain/types'

type Toast = { id: number; title: string; body?: string }

type Store = {
  member: string | null
  admin: string | null
  signIn: (email: string) => void
  signOut: () => void
  join: (name: string) => void
  leave: () => void
  cart: CartLine[]
  addToCart: (itemId: string, size: string) => void
  setQty: (itemId: string, size: string, qty: number) => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  bookings: Booking[]
  addBooking: (b: Booking) => void
  toast: (title: string, body?: string) => void
}

const Ctx = createContext<Store | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage blocked: keep state in memory */
    }
  }, [key, value])
  return [value, setValue] as const
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = usePersisted<string | null>('rvc.member', null)
  const [admin, setAdmin] = usePersisted<string | null>('rvc.admin', null)
  const [cart, setCart] = usePersisted<CartLine[]>('rvc.cart', [])
  const [bookings, setBookings] = usePersisted<Booking[]>('rvc.bookings', [])
  const [cartOpen, setCartOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const toast = useCallback((title: string, body?: string) => {
    const id = ++nextId.current
    setToasts((t) => [...t.slice(-2), { id, title, body }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])

  const value = useMemo<Store>(
    () => ({
      member,
      admin,
      signIn: (email) => setAdmin(email),
      signOut: () => setAdmin(null),
      join: (name) => setMember(`RVC-${String(Math.floor(1000 + Math.random() * 9000))} ${name}`.trim()),
      leave: () => setMember(null),
      cart,
      addToCart: (itemId, size) =>
        setCart((c) => {
          const hit = c.find((l) => l.itemId === itemId && l.size === size)
          return hit ? c.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l)) : [...c, { itemId, size, qty: 1 }]
        }),
      setQty: (itemId, size, qty) =>
        setCart((c) =>
          qty <= 0
            ? c.filter((l) => !(l.itemId === itemId && l.size === size))
            : c.map((l) => (l.itemId === itemId && l.size === size ? { ...l, qty } : l)),
        ),
      cartOpen,
      setCartOpen,
      bookings,
      addBooking: (b) => setBookings((list) => [b, ...list]),
      toast,
    }),
    [member, admin, cart, cartOpen, bookings, toast, setMember, setAdmin, setCart, setBookings],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-start gap-2 sm:left-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="animate-rise max-w-sm bg-fg px-4 py-3 text-void shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-wider">{t.title}</p>
            {t.body && <p className="mt-1 text-xs leading-relaxed text-void/70">{t.body}</p>}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore needs StoreProvider')
  return s
}
