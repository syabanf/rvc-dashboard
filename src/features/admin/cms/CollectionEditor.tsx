import { ImagePlus, Lock, Plus, Search, Trash2, X } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useContent, type Collection, type Content } from '../../../app/content'
import { useStore } from '../../../app/store'
import type { Scene, Tier } from '../../../domain/types'
import { compressImage } from '../../../ui/image'
import { Media } from '../../../ui/Media'
import { btn, Field, inputCls } from '../../../ui/ui'

// Image, tier and checkbox fields hold several controls, so they cannot sit inside one <label>.
const GROUPED = new Set(['image', 'tiers', 'checkbox'])
import { Card, ClearFilters, Drawer, PageTitle } from '../kit'

type Draft = Record<string, unknown>

export type FieldDef = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'image' | 'list' | 'tiers' | 'url'
  options?: { value: string; label: string }[]
  required?: boolean
  help?: string
}

export type Summary = { title: string; meta: string; image?: string; seed: string; scene: Scene; locked?: boolean; tag?: string }

const toLocalInput = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function ImageField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const { toast } = useStore()
  const [busy, setBusy] = useState(false)
  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await compressImage(file))
    } catch (e) {
      toast('Upload failed', (e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-2">
      <div className="relative aspect-video overflow-hidden border border-line-strong bg-raised">
        {value ? <img src={value} alt="" className="size-full object-cover" /> : <p className="grid size-full place-items-center text-[11px] uppercase tracking-[0.2em] text-subtle">Placeholder art</p>}
        {value && (
          <button type="button" aria-label="Remove image" onClick={() => onChange(undefined)} className="absolute right-2 top-2 grid size-8 place-items-center bg-panel/90 hover:bg-panel">
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <label className={btn('line', `h-10 flex-1 cursor-pointer ${busy ? 'opacity-50' : ''}`)}>
          <ImagePlus className="size-4" /> {busy ? 'Processing' : 'Upload'}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      </div>
      <input value={value?.startsWith('data:') ? '' : (value ?? '')} onChange={(e) => onChange(e.target.value || undefined)} placeholder="or paste an image URL" className={`${inputCls} h-10 text-xs`} />
    </div>
  )
}

function TiersField({ value, onChange }: { value: Tier[]; onChange: (v: Tier[]) => void }) {
  const set = (i: number, patch: Partial<Tier>) => onChange(value.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  return (
    <div className="space-y-2">
      {value.map((t, i) => (
        <div key={t.id} className="grid grid-cols-[1fr_7rem_auto] gap-2 border border-line p-2">
          <input aria-label="Tier name" value={t.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Tier name" className={`${inputCls} h-9 text-xs`} />
          <input aria-label="Price" type="number" min={0} value={t.price} onChange={(e) => set(i, { price: Number(e.target.value) })} className={`${inputCls} h-9 text-xs`} />
          <button type="button" aria-label={`Remove ${t.name || 'tier'}`} disabled={value.length === 1} onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-9 place-items-center text-muted hover:text-signal disabled:opacity-30">
            <Trash2 className="size-4" />
          </button>
          <input aria-label="Note" value={t.note} onChange={(e) => set(i, { note: e.target.value })} placeholder="Note shown under the tier" className={`${inputCls} col-span-2 h-9 text-xs`} />
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
            <input type="checkbox" checked={!!t.soldOut} onChange={(e) => set(i, { soldOut: e.target.checked })} className="accent-fg" /> Sold out
          </label>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { id: `tier-${Date.now().toString(36)}`, name: '', price: 0, note: '' }])} className={btn('ghost', 'h-9 px-0')}>
        <Plus className="size-4" /> Add tier
      </button>
    </div>
  )
}

function FieldInput({ f, value, set }: { f: FieldDef; value: unknown; set: (v: unknown) => void }) {
  switch (f.type) {
    case 'textarea':
      return <textarea rows={4} value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} className={`${inputCls} h-auto py-3`} />
    case 'number':
      return <input type="number" min={0} value={(value as number) ?? 0} onChange={(e) => set(Number(e.target.value))} className={inputCls} />
    case 'date':
      return <input type="date" value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} className={inputCls} />
    case 'datetime':
      return <input type="datetime-local" value={toLocalInput(value as string)} onChange={(e) => set(e.target.value ? new Date(e.target.value).toISOString() : '')} className={inputCls} />
    case 'select':
      return (
        <select value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} className={inputCls}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
    case 'checkbox':
      return (
        <span className="flex h-12 items-center gap-3 text-sm">
          <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} className="size-4 accent-fg" /> Yes
        </span>
      )
    case 'image':
      return <ImageField value={value as string | undefined} onChange={set} />
    case 'list':
      return <input value={((value as string[]) ?? []).join(', ')} onChange={(e) => set(e.target.value.split(',').map((x) => x.trimStart()))} placeholder="Comma separated" className={inputCls} />
    case 'tiers':
      return <TiersField value={(value as Tier[]) ?? []} onChange={set} />
    default:
      return <input type={f.type === 'url' ? 'url' : 'text'} value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} className={inputCls} />
  }
}

/** List, search, create, edit and delete for one content collection. */
export function CollectionEditor<K extends Collection>({
  collection,
  title,
  sub,
  noun,
  fields,
  summary,
  blank,
  minItems = 0,
  sitePath,
  toolbar,
  filter,
}: {
  collection: K
  title: string
  sub: string
  noun: string
  fields: FieldDef[]
  summary: (item: Content[K][number]) => Summary
  blank: () => Content[K][number]
  minItems?: number
  sitePath: string
  toolbar?: ReactNode
  filter?: (item: Content[K][number]) => boolean
}) {
  const content = useContent()
  const { toast } = useStore()
  const items = content[collection] as Content[K][number][]
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [armed, setArmed] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const rows = items.filter((it) => (!filter || filter(it)) && (!q || `${summary(it).title} ${summary(it).meta}`.toLowerCase().includes(q.toLowerCase())))
  const open = (it: Content[K][number], fresh = false) => {
    setDraft({ ...(it as Draft) })
    setIsNew(fresh)
    setArmed(false)
    setErrors([])
  }
  const close = () => setDraft(null)
  const save = () => {
    if (!draft) return
    const missing = fields.filter((f) => f.required && (draft[f.key] === '' || draft[f.key] === undefined)).map((f) => f.label)
    if (missing.length) return setErrors(missing)
    const clean = { ...draft }
    fields.filter((f) => f.type === 'list').forEach((f) => (clean[f.key] = ((clean[f.key] as string[]) ?? []).map((x) => x.trim()).filter(Boolean)))
    content.upsert(collection, clean as Content[K][number])
    toast(isNew ? `${noun} added` : `${noun} saved`, `Live on the site now. Saved in this browser until the CMS backend exists.`)
    close()
  }
  const remove = () => {
    if (!draft) return
    if (!armed) return setArmed(true)
    content.remove(collection, draft.id as string)
    toast(`${noun} deleted`, String(draft[fields[0].key] ?? ''))
    close()
  }

  return (
    <>
      <PageTitle
        title={title}
        sub={sub}
        actions={
          <>
            <Link to={sitePath} className={btn('line', 'h-9')}>
              View on site
            </Link>
            <button type="button" onClick={() => open(blank(), true)} className={btn('solid', 'h-9')}>
              <Plus className="size-4" /> New {noun.toLowerCase()}
            </button>
          </>
        }
      />
      <Card title={`All ${title.toLowerCase()}`} kicker={`${rows.length} of ${items.length}`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative w-full sm:w-72">
            <span className="sr-only">Search {title}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className={`${inputCls} h-10 pl-9`} />
          </label>
          {toolbar}
        </div>
        {rows.length === 0 ? (
          <ClearFilters title={`No ${title.toLowerCase()} match`} onClear={() => setQ('')} />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {rows.map((it, i) => {
              const s = summary(it)
              return (
                <li key={(it as { id: string }).id} data-reveal style={{ '--d': `${(i % 8) * 30}ms` } as CSSProperties}>
                  <button type="button" onClick={() => open(it)} className="group flex w-full gap-3 border border-line bg-panel p-2 text-left transition-colors hover:border-fg">
                    <span className="relative aspect-square w-20 shrink-0 overflow-hidden bg-raised">
                      <Media image={s.image} seed={s.seed} scene={s.scene} />
                      {s.locked && (
                        <span className="absolute left-1 top-1 grid size-5 place-items-center bg-fg text-void" title="RAW members only">
                          <Lock className="size-3" />
                        </span>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1">
                      <span className="truncate text-xs font-bold uppercase">{s.title || 'Untitled'}</span>
                      <span className="line-clamp-2 text-[11px] text-muted">{s.meta}</span>
                      {s.tag && <span className="text-[10px] uppercase tracking-[0.18em] text-subtle">{s.tag}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {draft && (
        <Drawer
          title={isNew ? `New ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}
          onClose={close}
          footer={
            <>
              {errors.length > 0 && <p role="alert" className="text-xs text-signal">Fill in: {errors.join(', ')}</p>}
              <button type="button" onClick={save} className={btn('solid')}>
                {isNew ? `Add ${noun.toLowerCase()}` : 'Save changes'}
              </button>
              {!isNew && (
                <button type="button" disabled={items.length <= minItems} onClick={remove} className={btn('line', armed ? 'border-signal text-signal' : '')}>
                  <Trash2 className="size-4" /> {items.length <= minItems ? `Keep at least ${minItems}` : armed ? 'Click again to delete' : 'Delete'}
                </button>
              )}
            </>
          }
        >
          <div className="space-y-5">
            {fields.map((f) => {
              const label = `${f.label}${f.required ? ' *' : ''}`
              const input = <FieldInput f={f} value={draft[f.key]} set={(v) => setDraft((d) => ({ ...d!, [f.key]: v }))} />
              const help = f.help && <span className="mt-1.5 block text-[11px] text-subtle">{f.help}</span>
              return GROUPED.has(f.type) ? (
                <div key={f.key} role="group" aria-label={f.label}>
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-muted">{label}</span>
                  {input}
                  {help}
                </div>
              ) : (
                <Field key={f.key} label={label}>
                  {input}
                  {help}
                </Field>
              )
            })}
          </div>
        </Drawer>
      )}
    </>
  )
}
