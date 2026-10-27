import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { SHOWS } from '../../data/catalog'
import { formatDate } from '../../domain/rules'
import { Frame } from '../../ui/Frame'
import { stagger } from '../../ui/reveal'
import { countBy, useFilter } from '../../ui/useFilter'
import { btn, Chips, Empty, PageHead } from '../../ui/ui'

const YEARS = [...new Set(SHOWS.map((s) => s.date.slice(0, 4)))]

export default function Shows() {
  const [year, setYear] = useFilter<string>('year')
  const list = SHOWS.filter((s) => year === 'All' || s.date.startsWith(year))
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8">
      <PageHead index="04" kicker="Archive" title={'Past\nShows'}>
        {SHOWS.length} nights since a basement in Kemang. Open a show for its photos, videos and the story behind it.
      </PageHead>
      <Chips label="Filter by year" options={YEARS} value={year} onChange={setYear} counts={countBy(SHOWS, (s) => s.date.slice(0, 4))} />
      {list.length === 0 ? (
        <Empty title="No shows that year" action={<button type="button" className={btn('line')} onClick={() => setYear('All')}>Clear filter</button>} />
      ) : (
        <ol className="border-t border-line">
          {list.map((s, i) => (
            <li key={s.id} data-reveal style={stagger(i)} className="border-b border-line">
              <Link to={`/shows/${s.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-6 md:grid-cols-[4rem_10rem_1fr_14rem_auto] md:gap-6">
                <span className="hidden text-xs text-subtle tabular md:block">{String(SHOWS.length - SHOWS.indexOf(s)).padStart(2, '0')}</span>
                <div className="relative hidden aspect-[4/3] overflow-hidden md:block">
                  <div className="absolute inset-0 grayscale transition-transform duration-500 group-hover:scale-110">
                    <Frame seed={s.id} scene={s.scene} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted tabular">{formatDate(s.date)}</p>
                  <h2 className="font-display text-2xl uppercase leading-none transition-transform group-hover:translate-x-2 md:text-5xl">{s.title}</h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-body md:hidden">
                    {s.venue}, {s.city}
                  </p>
                </div>
                <div className="hidden text-xs uppercase leading-relaxed tracking-[0.18em] text-body md:block">
                  <p>{s.venue}</p>
                  <p className="text-muted">
                    {s.city} · {s.headcount}
                  </p>
                </div>
                <ArrowUpRight className="size-6 text-muted transition-colors group-hover:text-fg" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
