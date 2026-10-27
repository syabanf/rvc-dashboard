import type { Scene } from '../domain/types'
import { Frame } from './Frame'

/** An uploaded image when there is one, otherwise the generated placeholder. */
export function Media({ image, seed, scene, label, className = '' }: { image?: string; seed: string; scene: Scene; label?: string; className?: string }) {
  if (!image) return <Frame seed={seed} scene={scene} label={label} className={className} />
  return <img src={image} alt={label ?? ''} loading="lazy" className={`block size-full object-cover ${className}`} />
}
