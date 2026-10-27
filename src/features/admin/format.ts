const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
export const idrShort = (n: number) => `IDR ${compact.format(n)}`
export const num = (n: number) => n.toLocaleString('en')
export const timeOf = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
