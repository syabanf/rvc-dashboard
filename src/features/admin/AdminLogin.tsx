import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useStore } from '../../app/store'
import { DEMO_ADMIN } from '../../data/admin'
import { isEmail } from '../../domain/rules'
import { Frame } from '../../ui/Frame'
import { btn, Field, Halftone, inputCls } from '../../ui/ui'

export default function AdminLogin() {
  const { signIn, toast } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!isEmail(email) || !password) return setError('Enter your email and password.')
    setBusy(true)
    setError('')
    // A short wait so the busy state reads like a real round trip.
    setTimeout(() => {
      setBusy(false)
      if (email.trim().toLowerCase() !== DEMO_ADMIN.email || password !== DEMO_ADMIN.password) {
        setPassword('')
        return setError('Wrong email or password.')
      }
      signIn(DEMO_ADMIN.email)
      toast('Signed in', 'Welcome to the control room.')
    }, 700)
  }

  const fillDemo = () => {
    setEmail(DEMO_ADMIN.email)
    setPassword(DEMO_ADMIN.password)
    setError('')
  }

  return (
    <div className="grid min-h-dvh bg-void text-fg lg:grid-cols-[1.15fr_1fr]">
      <section aria-hidden className="grain relative isolate hidden overflow-hidden border-r border-line bg-black lg:block">
        <div className="absolute inset-0 opacity-40">
          <Frame seed="control-room" scene="stage" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        <div className="animate-scan absolute inset-x-0 top-0 h-px bg-fg shadow-[0_0_24px_4px_rgba(255,255,255,0.6)] [animation-delay:0.3s]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <img src="/rvc-logo.png" alt="" className="h-8 w-auto self-start" />
          <Halftone as="p" lines={['Control', 'Room']} className="text-[clamp(4rem,8.5vw,9rem)] [--ht-dot:7px]" />
          <p className="max-w-sm text-xs uppercase leading-relaxed tracking-[0.2em] text-muted">Ticketing, merch and membership for the Raw Vision team.</p>
        </div>
      </section>

      <section className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted hover:text-fg">
            <ArrowLeft className="size-4" /> Back to site
          </Link>
          <img src="/rvc-logo.png" alt="Raw Vision Collective" className="h-6 w-auto lg:hidden" />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p data-reveal className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted">
            <Lock className="size-3.5" /> Admin / Restricted
          </p>
          <h1 data-reveal style={{ '--d': '100ms' } as CSSProperties} className="font-display text-4xl uppercase leading-none md:text-5xl">
            Sign in<span className="animate-blink text-signal">_</span>
          </h1>
          <p data-reveal style={{ '--d': '180ms' } as CSSProperties} className="mt-4 text-sm leading-relaxed text-body">
            Team access to sales, bookings and stock.
          </p>

          <form onSubmit={submit} noValidate data-reveal style={{ '--d': '260ms' } as CSSProperties} className="mt-10 space-y-5">
            <Field label="Email">
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} className={inputCls} />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-fg">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            {error && (
              <p role="alert" className="animate-rise border border-signal/60 bg-signal/10 px-3 py-2.5 text-xs text-signal">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className={btn('solid', 'w-full')}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Checking
                </>
              ) : (
                'Enter control room'
              )}
            </button>
          </form>

          <div data-reveal style={{ '--d': '340ms' } as CSSProperties} className="mt-8 border border-dashed border-line-strong p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Demo build</p>
            <p className="mt-2 text-xs leading-relaxed text-body">This check runs in the browser and protects nothing. Real sign-in comes with the backend.</p>
            <button type="button" onClick={fillDemo} className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-fg underline underline-offset-4 hover:text-body">
              Fill demo login
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
