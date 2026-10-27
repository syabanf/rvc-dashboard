import type { CartLine, MerchItem, Tier } from './types'

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
export const formatIDR = (n: number) => idr.format(n)

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-GB', opts).toUpperCase()

export function countdown(iso: string, now = Date.now()) {
  const ms = Math.max(0, new Date(iso).getTime() - now)
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  }
}

export const bookingTotal = (tier: Tier, qty: number) => tier.price * qty

export const cartTotal = (lines: CartLine[], items: MerchItem[]) =>
  lines.reduce((sum, l) => sum + (items.find((i) => i.id === l.itemId)?.price ?? 0) * l.qty, 0)

export function makeCode(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `${prefix}-${out}`
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
