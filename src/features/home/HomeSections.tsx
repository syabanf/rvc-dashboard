import { ArrowUpRight, Play } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useContent } from '../../app/content'
import { useStore } from '../../app/store'
import type { Video } from '../../domain/types'
import { Magnetic, SplitText, Words } from '../../ui/fx'
import { youtubeId } from '../../ui/image'
import { Media } from '../../ui/Media'
import { CountUp } from '../../ui/motion'
import { Player } from '../../ui/Player'

const FRAME_MS = 3200

/** Running 25 fps timecode written straight to the DOM, so it doesn't re-render the section. */
function Timecode() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const f = Math.floor(((t - t0) / 1000) * 25)
      const pad = (n: number) => String(n).padStart(2, '0')
      if (ref.current) ref.current.textContent = `00:${pad(Math.floor(f / 1500) % 60)}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <span ref={ref} className="tabular">00:00:00:00</span>
}

/**
 * The collective's aftermovie. A direct video file plays muted in the frame; otherwise archive
 * photos run as a reel. Play opens the full film, set in Admin, Videos.
 */
export function Film() {
  const { videos, photos, showById } = useContent()
  const { toast } = useStore()
  const film = videos.find((v) => v.kind === 'Aftermovie' && !v.membersOnly) ?? videos[0]
  const frames = photos.filter((p) => p.image && !p.membersOnly).slice(0, 6)
  const [cycle, setCycle] = useState(0)
  const [playing, setPlaying] = useState<Video | null>(null)
  const loop = film?.url && !youtubeId(film.url) ? film.url : null
  const idx = frames.length ? cycle % frames.length : 0

  useEffect(() => {
    if (loop || frames.length < 2) return
    const t = setInterval(() => setCycle((c) => c + 1), FRAME_MS)
    return () => clearInterval(t)
  }, [loop, frames.length])

  if (!film) return null
  const play = () => (film.url ? setPlaying(film) : toast('No film link yet', `Add a YouTube or video link to ${film.title} in Admin, Videos.`))

  return (
    <section aria-labelledby="film-title" className="overflow-hidden bg-fg py-16 text-void md:py-24">
      <div className="mx-auto mb-10 grid max-w-[1440px] gap-6 px-4 md:grid-cols-[1fr_auto] md:items-end md:px-8">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-void/60">
            <span className="animate-blink inline-block size-2 rounded-full bg-signal" /> Side A · The film
          </p>
          <h2 id="film-title" className="font-display text-[clamp(2.6rem,8vw,7rem)] uppercase leading-[0.88] tracking-[-0.03em]">
            <SplitText text="The Raw Vision film" />
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-void/70">
          <Words text={`${film.title}. ${film.minutes} minutes from ${showById(film.showId)?.title ?? 'the archive'}, cut by the crew who built the night.`} />
        </p>
      </div>

      <div className="film-grow relative mx-auto aspect-[4/5] max-w-[1440px] overflow-hidden bg-black sm:aspect-video">
        {loop ? (
          <video src={loop} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" />
        ) : (
          frames.map((p, i) => (
            <div key={p.id} className={`absolute inset-0 transition-opacity duration-[1400ms] ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
              <div key={i === idx ? cycle : 'idle'} className={`size-full ${i === idx ? 'kenburns' : ''}`}>
                <Media image={p.image} seed={p.id} scene={p.scene} label={p.caption} ripple={false} />
              </div>
            </div>
          ))
        )}
        <div aria-hidden className="scanline absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.65))]" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 text-[10px] uppercase tracking-[0.25em] text-white md:p-6 md:text-xs">
          <p className="flex items-center gap-2">
            <span className="animate-blink inline-block size-2 rounded-full bg-signal" /> Rec <Timecode />
          </p>
          <p className="text-right">
            CH 01 · {film.kind}
            <br />
            <span className="text-white/60">{frames[idx]?.caption}</span>
          </p>
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <Magnetic strength={0.4}>
            <button type="button" onClick={play} aria-label={`Play ${film.title}`} data-cursor="Play" className="group relative grid size-24 place-items-center rounded-full bg-signal text-fg md:size-32">
              <span aria-hidden className="absolute inset-0 rounded-full border-2 border-signal [animation:pulse-ring_1.8s_ease-out_infinite]" />
              <span aria-hidden className="absolute inset-0 rounded-full border-2 border-signal [animation:pulse-ring_1.8s_ease-out_0.9s_infinite]" />
              <Play className="ml-1 size-9 fill-current transition-transform duration-300 group-hover:scale-110 md:size-11" />
            </button>
          </Magnetic>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white md:p-6">
          {!loop && frames.length > 1 && (
            <div aria-hidden className="flex gap-1.5">
              {frames.map((p, i) => (
                <span key={p.id} className="h-0.5 flex-1 overflow-hidden bg-white/25">
                  <span key={i === idx ? cycle : 'still'} className={`block h-full origin-left bg-white ${i < idx ? '' : i === idx ? '[animation:progress_3.2s_linear_both]' : 'scale-x-0'}`} />
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end justify-between gap-4 text-[10px] uppercase tracking-[0.25em] md:text-xs">
            <span>
              {film.title} · {film.minutes}:00
            </span>
            <Link to="/videos" className="flex shrink-0 items-center gap-1 hover:text-signal">
              All films <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
      {playing && <Player video={playing} onClose={() => setPlaying(null)} />}
    </section>
  )
}

const crowdOf = (headcount: string) => Number(headcount.replace(/\D/g, ''))

/** The collective's story in numbers, then one bar per night sized by its crowd. Bars hold the show photo. */
export function Growth() {
  const { shows, photos } = useContent()
  const nights = [...shows].sort((a, b) => a.date.localeCompare(b.date))
  const crowds = nights.map((s) => crowdOf(s.headcount))
  const counted = crowds.filter(Boolean)
  const min = Math.min(...counted)
  const max = Math.max(...counted)
  // Log scale so a 180-person basement still reads next to thousands. Unnumbered nights (a stadium) top out.
  const height = (n: number) => (n ? 14 + (72 * Math.log(n / min + 1)) / Math.log(max / min + 1) : 100)
  const first = nights[0]
  const stats: [string, number, string][] = [
    ['Nights produced', nights.length, ''],
    ['Through the doors', counted.reduce((a, b) => a + b, 0), counted.length < crowds.length ? '+' : ''],
    ['Cities', new Set(nights.map((s) => s.city)).size, ''],
    ['Frames in the vault', photos.length, ''],
  ]

  return (
    <section aria-labelledby="growth-title" className="border-t border-line py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-muted">Since the basement · {first?.date.slice(0, 4)}</p>
      <h2 id="growth-title" className="max-w-4xl font-display text-3xl uppercase leading-[0.95] md:text-6xl">
        <Words text={`From ${first?.headcount ?? 'a few'} people in ${first?.venue.toLowerCase() ?? 'a room'} to a stadium in the round.`} />
      </h2>

      <dl className="mt-12 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {stats.map(([label, value, suffix], i) => (
          <div key={label} data-reveal style={{ '--d': `${i * 90}ms` } as CSSProperties} className="bg-void py-6 pr-4 md:py-8">
            <dt className="text-[10px] uppercase tracking-[0.25em] text-muted">
              0{i + 1} / {label}
            </dt>
            <dd className="mt-2 font-display text-4xl tabular md:text-6xl">
              <CountUp value={value} format={(n) => n.toLocaleString('en-US') + suffix} />
            </dd>
          </div>
        ))}
      </dl>

      <ol data-reveal aria-label="Crowd size per night" className="mt-14 grid grid-flow-col auto-cols-fr gap-2 md:gap-4">
        {nights.map((s, i) => (
          <li key={s.id} className="min-w-0">
            <Link to={`/shows/${s.id}`} className="group block" aria-label={`${s.title}, ${s.headcount}`}>
              <span className="relative flex h-56 items-end border-b-2 border-fg md:h-80">
                <span style={{ '--h': `${height(crowds[i])}%`, '--d': `${200 + i * 120}ms` } as CSSProperties} className="bar relative block w-full overflow-hidden bg-fg">
                  <span className="absolute inset-0 opacity-70 grayscale transition duration-700 group-hover:opacity-100 group-hover:grayscale-0">
                    <Media image={s.image} seed={s.id} scene={s.scene} ripple={false} />
                  </span>
                  <span className="absolute inset-x-0 top-0 bg-signal px-1.5 py-1 text-center text-[9px] font-bold uppercase tracking-[0.1em] text-fg md:text-[11px]">{s.headcount}</span>
                </span>
              </span>
              <span className="mt-3 block text-xs tabular text-muted">{s.date.slice(0, 4)}</span>
              <span className="mt-1 hidden truncate text-[11px] font-bold uppercase tracking-[0.1em] transition-colors group-hover:text-signal sm:block">{s.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
