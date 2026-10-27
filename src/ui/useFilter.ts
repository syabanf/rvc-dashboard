import { useSearchParams } from 'react-router'

/** One filter value kept in the URL so a filtered view can be shared. */
export function useFilter<T extends string>(key: string) {
  const [params, setParams] = useSearchParams()
  const value = (params.get(key) ?? 'All') as T | 'All'
  const set = (v: T | 'All') =>
    setParams(
      (p) => {
        if (v === 'All') p.delete(key)
        else p.set(key, v)
        return p
      },
      { replace: true },
    )
  return [value, set] as const
}

export function countBy<T>(items: T[], pick: (i: T) => string) {
  const out: Record<string, number> = { All: items.length }
  for (const i of items) out[pick(i)] = (out[pick(i)] ?? 0) + 1
  return out
}
