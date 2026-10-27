import { useState } from 'react'
import { useContent } from '../../../app/content'
import { formatDate, formatIDR } from '../../../domain/rules'
import { MERCH_CATEGORIES, VIDEO_KINDS, type MerchItem, type PastShow, type Photo, type UpcomingEvent, type Video } from '../../../domain/types'
import { inputCls } from '../../../ui/ui'
import { CollectionEditor, type FieldDef } from './CollectionEditor'

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`
const opts = (xs: readonly string[]) => xs.map((x) => ({ value: x, label: x }))
const MEMBERS: FieldDef = { key: 'membersOnly', label: 'RAW members only', type: 'checkbox', help: 'Locked on the site until a visitor joins RAW.' }

function useShowOptions() {
  const { shows } = useContent()
  return shows.map((s) => ({ value: s.id, label: s.title }))
}

function ShowFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = useShowOptions()
  return (
    <select aria-label="Filter by show" value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} h-10 w-full sm:w-64`}>
      <option value="">All shows</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function PhotosEditor() {
  const shows = useShowOptions()
  const { showById } = useContent()
  const [show, setShow] = useState('')
  return (
    <CollectionEditor
      collection="photos"
      title="Photos"
      sub="The Exclusive Photos gallery, the home filmstrip and each show page."
      noun="Photo"
      sitePath="/photos"
      toolbar={<ShowFilter value={show} onChange={setShow} />}
      filter={(p: Photo) => !show || p.showId === show}
      fields={[
        { key: 'image', label: 'Image', type: 'image', help: 'Uploads shrink to 1400px JPEG so they fit in browser storage.' },
        { key: 'caption', label: 'Caption', type: 'text', required: true },
        { key: 'credit', label: 'Photographer', type: 'text', required: true },
        { key: 'showId', label: 'Show', type: 'select', options: shows },
        { key: 'tall', label: 'Portrait frame', type: 'checkbox', help: 'Shows taller in the gallery grid.' },
        MEMBERS,
      ]}
      summary={(p: Photo) => ({ title: p.caption, meta: `${showById(p.showId)?.title ?? 'No show'} · ${p.credit}`, image: p.image, seed: p.id, scene: p.scene, locked: p.membersOnly })}
      blank={(): Photo => ({ id: newId('p'), showId: shows[0]?.value ?? '', caption: '', credit: '', scene: 'crowd' })}
    />
  )
}

export function VideosEditor() {
  const shows = useShowOptions()
  const { showById } = useContent()
  const [show, setShow] = useState('')
  return (
    <CollectionEditor
      collection="videos"
      title="Videos"
      sub="The Exclusive Videos screening room and each show page."
      noun="Video"
      sitePath="/videos"
      minItems={1}
      toolbar={<ShowFilter value={show} onChange={setShow} />}
      filter={(v: Video) => !show || v.showId === show}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'url', label: 'Video link', type: 'url', help: 'A YouTube link or a direct .mp4 URL. Empty shows a "no video yet" note.' },
        { key: 'image', label: 'Thumbnail', type: 'image' },
        { key: 'kind', label: 'Type', type: 'select', options: opts(VIDEO_KINDS) },
        { key: 'showId', label: 'Show', type: 'select', options: shows },
        { key: 'minutes', label: 'Length (minutes)', type: 'number' },
        MEMBERS,
      ]}
      summary={(v: Video) => ({ title: v.title, meta: `${v.kind} · ${v.minutes} min · ${showById(v.showId)?.title ?? 'No show'}`, image: v.image, seed: v.id, scene: v.scene, locked: v.membersOnly, tag: v.url ? 'Has video link' : 'No video link' })}
      blank={(): Video => ({ id: newId('v'), showId: shows[0]?.value ?? '', title: '', kind: 'Aftermovie', minutes: 5, scene: 'stage' })}
    />
  )
}

export function ShowsEditor() {
  return (
    <CollectionEditor
      collection="shows"
      title="Past shows"
      sub="The Past Shows archive, show pages and the home hero photo (newest show)."
      noun="Show"
      sitePath="/shows"
      minItems={1}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'image', label: 'Cover photo', type: 'image', help: 'The newest show also fills the home hero.' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'venue', label: 'Venue', type: 'text', required: true },
        { key: 'city', label: 'City', type: 'text', required: true },
        { key: 'headcount', label: 'Crowd', type: 'text', help: 'Free text, for example 2,400 or Stadium.' },
        { key: 'blurb', label: 'Story', type: 'textarea' },
      ]}
      summary={(s: PastShow) => ({ title: s.title, meta: `${s.venue}, ${s.city}`, image: s.image, seed: s.id, scene: s.scene, tag: formatDate(s.date, { day: '2-digit', month: 'short', year: 'numeric' }) })}
      blank={(): PastShow => ({ id: newId('show'), title: '', city: '', venue: '', date: new Date().toISOString().slice(0, 10), headcount: '', blurb: '', scene: 'crowd' })}
    />
  )
}

export function EventsEditor() {
  return (
    <CollectionEditor
      collection="events"
      title="Upcoming events"
      sub="The Events page, RSVP and booking, and the home countdown."
      noun="Event"
      sitePath="/events"
      minItems={1}
      fields={[
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'image', label: 'Event image', type: 'image' },
        { key: 'startsAt', label: 'Starts at', type: 'datetime', required: true },
        { key: 'venue', label: 'Venue', type: 'text', required: true },
        { key: 'city', label: 'City', type: 'text', required: true },
        {
          key: 'status',
          label: 'Sales status',
          type: 'select',
          options: [
            { value: 'open', label: 'Tickets on sale' },
            { value: 'presale', label: 'RAW presale only' },
            { value: 'waitlist', label: 'Waitlist' },
          ],
        },
        { key: 'blurb', label: 'Description', type: 'textarea' },
        { key: 'tiers', label: 'Ticket tiers', type: 'tiers' },
      ]}
      summary={(e: UpcomingEvent) => ({ title: e.title, meta: `${e.venue}, ${e.city}`, image: e.image, seed: e.id, scene: e.status === 'open' ? 'stage' : 'crowd', tag: `${formatDate(e.startsAt, { day: '2-digit', month: 'short', year: 'numeric' })} · ${e.status}` })}
      blank={(): UpcomingEvent => ({
        id: newId('event'),
        title: '',
        city: 'Jakarta',
        venue: '',
        startsAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        status: 'open',
        blurb: '',
        tiers: [{ id: newId('tier'), name: 'General Admission', price: 450_000, note: '' }],
      })}
    />
  )
}

export function ProductsEditor() {
  const [cat, setCat] = useState('')
  return (
    <CollectionEditor
      collection="merch"
      title="Products"
      sub="Everything in the Exclusive Merch shop. Stock counts and orders live under Sales, Merch."
      noun="Product"
      sitePath="/merch"
      toolbar={
        <select aria-label="Filter by category" value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} h-10 w-full sm:w-48`}>
          <option value="">All categories</option>
          {MERCH_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      }
      filter={(m: MerchItem) => !cat || m.category === cat}
      fields={[
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Product photo', type: 'image' },
        { key: 'price', label: 'Price (IDR)', type: 'number', required: true },
        { key: 'category', label: 'Category', type: 'select', options: opts(MERCH_CATEGORIES) },
        { key: 'sizes', label: 'Sizes', type: 'list', help: 'Comma separated, for example S, M, L, XL.' },
        {
          key: 'stock',
          label: 'Stock label',
          type: 'select',
          options: [
            { value: 'in', label: 'In stock' },
            { value: 'low', label: 'Low stock' },
            { value: 'out', label: 'Sold out' },
          ],
        },
        MEMBERS,
      ]}
      summary={(m: MerchItem) => ({ title: m.name, meta: `${m.category} · ${formatIDR(m.price)}`, image: m.image, seed: m.id, scene: m.scene, locked: m.membersOnly, tag: m.stock === 'out' ? 'Sold out' : m.stock === 'low' ? 'Low stock' : 'In stock' })}
      blank={(): MerchItem => ({ id: newId('m'), name: '', category: 'Tees', price: 350_000, sizes: ['S', 'M', 'L', 'XL'], stock: 'in', scene: 'object' })}
    />
  )
}

export function PlansEditor() {
  return (
    <CollectionEditor
      collection="plans"
      title="Membership"
      sub="RAW membership plans on the secret page."
      noun="Plan"
      sitePath="/raw"
      minItems={1}
      fields={[
        { key: 'name', label: 'Plan name', type: 'text', required: true },
        { key: 'price', label: 'Price (IDR)', type: 'number', required: true },
        { key: 'period', label: 'Billing period', type: 'select', options: opts(['month', 'year']) },
        { key: 'perks', label: 'Perks', type: 'list', help: 'Comma separated. Each perk becomes one line.' },
      ]}
      summary={(p) => ({ title: p.name, meta: `${formatIDR(p.price)} / ${p.period}`, seed: p.id, scene: 'portrait', tag: `${p.perks.length} perks` })}
      blank={() => ({ id: newId('plan'), name: '', price: 150_000, period: 'month', perks: [] })}
    />
  )
}
