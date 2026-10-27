import type { Scene } from '../domain/types'
import { Frame } from './Frame'
import { Ripple } from './fx'

/** An uploaded image when there is one, otherwise the generated placeholder. Ripples on hover unless turned off. */
export function Media({ image, seed, scene, label, className = '', ripple = true, cursor }: { image?: string; seed: string; scene: Scene; label?: string; className?: string; ripple?: boolean; cursor?: string }) {
  const art = image ? <img src={image} alt={label ?? ''} loading="lazy" className={`block size-full object-cover ${className}`} /> : <Frame seed={seed} scene={scene} label={label} className={className} />
  return ripple ? <Ripple cursor={cursor}>{art}</Ripple> : art
}
