import { useId, useMemo } from 'react'
import type { Scene } from '../domain/types'

/**
 * Procedural black-and-white "photo" that stands in for real media until the
 * archive is uploaded. The seed keeps each image stable between renders.
 */
function rng(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function Crowd({ r, y = 300 }: { r: () => number; y?: number }) {
  return (
    <g fill="#050505">
      {Array.from({ length: 34 }, (_, i) => {
        const x = i * 12.5 - 10 + r() * 8
        const h = 34 + r() * 30
        return (
          <g key={i}>
            <circle cx={x} cy={y - h} r={6 + r() * 2} />
            <rect x={x - 8} y={y - h + 5} width={16} height={h} rx={6} />
            {r() > 0.72 && <rect x={x + 2} y={y - h - 34} width={4} height={34} rx={2} transform={`rotate(${r() * 30 - 15} ${x} ${y - h})`} />}
          </g>
        )
      })}
    </g>
  )
}

function SceneArt({ scene, r, uid }: { scene: Scene; r: () => number; uid: string }) {
  switch (scene) {
    case 'stadium': {
      const rings = 9
      return (
        <g>
          <rect width="400" height="300" fill="#2a2a2a" />
          {Array.from({ length: rings }, (_, i) => (
            <ellipse key={i} cx="200" cy="160" rx={190 - i * 13} ry={150 - i * 10} fill="none" stroke={i % 2 ? '#d9d9d9' : '#8c8c8c'} strokeWidth={6} strokeDasharray={`${2 + (i % 3)} 3`} />
          ))}
          <ellipse cx="200" cy="160" rx="72" ry="58" fill="#9b9b9b" />
          <ellipse cx="200" cy="160" rx="54" ry="42" fill="none" stroke="#c4c4c4" strokeWidth="2" />
          <circle cx="200" cy="158" r="20" fill={`url(#${uid}-sphere)`} />
          <path d="M60 300 L150 215 M340 300 L250 215" stroke="#111" strokeWidth="5" />
        </g>
      )
    }
    case 'stage':
      return (
        <g>
          <rect width="400" height="300" fill="#0b0b0b" />
          {Array.from({ length: 5 }, (_, i) => {
            const x = 40 + i * 80 + r() * 20
            return <path key={i} d={`M${x} -10 L${x - 70 - r() * 40} 240 L${x + 70 + r() * 40} 240 Z`} fill={`url(#${uid}-beam)`} opacity={0.35 + r() * 0.4} />
          })}
          <rect x="0" y="228" width="400" height="10" fill="#1d1d1d" />
          <circle cx={170 + r() * 60} cy="200" r="7" fill="#000" />
          <rect x={162 + r() * 60} y="206" width="16" height="24" rx="5" fill="#000" />
          <Crowd r={r} />
        </g>
      )
    case 'crowd':
      return (
        <g>
          <rect width="400" height="300" fill="#141414" />
          <ellipse cx={120 + r() * 160} cy="70" rx="230" ry="120" fill={`url(#${uid}-glow)`} />
          <Crowd r={r} y={250} />
          <Crowd r={r} />
        </g>
      )
    case 'portrait':
      return (
        <g>
          <rect width="400" height="300" fill="#101010" />
          <circle cx="200" cy="120" r="150" fill={`url(#${uid}-glow)`} />
          <circle cx="200" cy="118" r="42" fill="#030303" />
          <path d="M95 300 C110 200 150 175 200 175 C250 175 290 200 305 300 Z" fill="#030303" />
        </g>
      )
    default:
      return (
        <g>
          <rect width="400" height="300" fill="#121212" />
          <ellipse cx="200" cy="250" rx="160" ry="30" fill="#2b2b2b" />
          <path d="M200 -20 L90 250 L310 250 Z" fill={`url(#${uid}-beam)`} opacity="0.55" />
          <rect x={150 + r() * 20} y={150} width={80} height={95} rx={r() > 0.5 ? 40 : 4} fill="#d0d0d0" />
        </g>
      )
  }
}

export function Frame({ seed, scene, className = '', label }: { seed: string; scene: Scene; className?: string; label?: string }) {
  const uid = useId().replace(/:/g, '')
  const art = useMemo(() => <SceneArt scene={scene} r={rng(seed)} uid={uid} />, [scene, seed, uid])
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={`block size-full ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#e8e8e8" />
          <stop offset="1" stopColor="#e8e8e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-sphere`} cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#bbb" />
          <stop offset="1" stopColor="#111" />
        </radialGradient>
        <radialGradient id={`${uid}-vig`}>
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <pattern id={`${uid}-screen`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0h4v4H0z M2 0.5a1.5 1.5 0 1 0 0.001 0z" fillRule="evenodd" fill="#000" />
        </pattern>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed.length} />
          <feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      {art}
      <rect width="400" height="300" fill={`url(#${uid}-vig)`} />
      <rect width="400" height="300" filter={`url(#${uid}-grain)`} opacity="0.5" />
      <rect width="400" height="300" className="frame-screen" fill={`url(#${uid}-screen)`} opacity="0.35" />
    </svg>
  )
}
