import Image from 'next/image'
import { cn } from '@/lib/utils'

const ART = {
  hero: '/media/onboarding-hero.svg',
  rhythm: '/media/routine-rhythm.svg',
  goals: '/media/goals-constellation.svg',
  orb: '/media/focus-orb.svg',
} as const

export type MediaArtVariant = keyof typeof ART

/**
 * MediaArt — brand artwork served from public/media.
 */
export function MediaArt({
  variant,
  alt,
  className,
  imgClassName,
}: {
  variant: MediaArtVariant
  alt: string
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={cn('relative overflow-hidden', className)} aria-hidden={alt === ''}>
      <Image
        src={ART[variant]}
        alt={alt}
        fill
        sizes="(max-width: 640px) 90vw, 640px"
        className={cn('object-cover', imgClassName)}
      />
    </div>
  )
}
