import { RotateCcw } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useContent } from '../../../app/content'
import { useStore } from '../../../app/store'
import type { Site } from '../../../domain/types'
import { btn, Field, inputCls } from '../../../ui/ui'
import { Card, PageTitle } from '../kit'

function SiteForm() {
  const content = useContent()
  const { toast } = useStore()
  const [draft, setDraft] = useState<Site>(content.site)
  const [armed, setArmed] = useState(false)
  const set = (patch: Partial<Site>) => setDraft((d) => ({ ...d, ...patch }))
  const dirty = JSON.stringify(draft) !== JSON.stringify(content.site)

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.rawCode.trim()) return toast('Add a RAW access code', 'An empty code would lock everyone out of the vault.')
    content.setSite({ ...draft, heroLeft: draft.heroLeft.trim(), heroRight: draft.heroRight.trim(), rawCode: draft.rawCode.trim() })
    toast('Site settings saved', 'Live on the landing page now.')
  }
  const reset = () => {
    if (!armed) return setArmed(true)
    content.reset()
    toast('Content reset', 'Every page is back to the original demo content.')
  }

  return (
    <>
      <PageTitle
        title="Site & hero"
        sub="Home hero, about text, ticker and the RAW access code."
        actions={
          <Link to="/" className={btn('line', 'h-9')}>
            View home
          </Link>
        }
      />
      <form onSubmit={save} className="grid gap-4 xl:grid-cols-3">
        <Card title="Home hero" kicker="Below the halftone title" className="xl:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Featured event">
              <select value={draft.heroEventId} onChange={(e) => set({ heroEventId: e.target.value })} className={inputCls}>
                {content.events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Left word">
                <input value={draft.heroLeft} onChange={(e) => set({ heroLeft: e.target.value })} maxLength={12} className={`${inputCls} uppercase`} />
              </Field>
              <Field label="Right word">
                <input value={draft.heroRight} onChange={(e) => set({ heroRight: e.target.value })} maxLength={12} className={`${inputCls} uppercase`} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Ticker text">
                <input value={draft.ticker} onChange={(e) => set({ ticker: e.target.value })} placeholder="Leave empty to build it from the featured event" className={inputCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="About text">
                <textarea rows={4} value={draft.about} onChange={(e) => set({ about: e.target.value })} className={`${inputCls} h-auto py-3`} />
              </Field>
            </div>
          </div>
        </Card>
        <Card title="RAW vault" kicker="Secret page">
          <Field label="Access code">
            <input value={draft.rawCode} onChange={(e) => set({ rawCode: e.target.value })} className={`${inputCls} uppercase tracking-[0.3em]`} />
          </Field>
          <p className="mt-3 text-[11px] leading-relaxed text-subtle">Visitors who enter this code unlock RAW on their device. The check runs in the browser, so treat the code as a teaser, not security.</p>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel p-4 xl:col-span-3">
          <button type="button" onClick={reset} className={btn('ghost', `h-10 ${armed ? 'text-signal' : ''}`)}>
            <RotateCcw className="size-4" /> {armed ? 'Click again to reset all content' : 'Reset all content to demo'}
          </button>
          <button type="submit" disabled={!dirty} className={btn('solid')}>
            {dirty ? 'Save settings' : 'Saved'}
          </button>
        </div>
      </form>
    </>
  )
}

// Remounts after every save or reset so the form always starts from what is live.
export default function SiteEditor() {
  const { site } = useContent()
  return <SiteForm key={JSON.stringify(site)} />
}
