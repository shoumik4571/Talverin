import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NeonGradientCardProps {
  className?: string
  children?: ReactNode
  borderSize?: number
  borderRadius?: number
  neonColors?: {
    firstColor: string
    secondColor: string
  }
}

export const NeonGradientCard = ({
  className,
  children,
  borderSize = 2,
  borderRadius = 20,
  neonColors = {
    firstColor: '#ff00aa',
    secondColor: '#00FFF1',
  },
}: NeonGradientCardProps) => {
  return (
    <div
      style={
        {
          '--border-size': `${borderSize}px`,
          '--border-radius': `${borderRadius}px`,
          '--neon-first-color': neonColors.firstColor,
          '--neon-second-color': neonColors.secondColor,
          '--card-content-radius': `calc(var(--border-radius) - var(--border-size))`,
        } as CSSProperties
      }
      className={cn(
        'relative z-10 size-full rounded-[var(--border-radius)] p-[var(--border-size)]',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[var(--border-radius)] border-[var(--border-size)] border-transparent opacity-80 [background:linear-gradient(var(--neon-first-color),var(--neon-second-color))_border-box] [mask:linear-gradient(white_0_0)_padding-box,linear-gradient(white_0_0)] [mask-composite:exclude]',
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[var(--border-radius)] opacity-40 blur-2xl [background:linear-gradient(120deg,var(--neon-first-color),var(--neon-second-color))]',
        )}
      />
      <div className="relative rounded-[var(--card-content-radius)] bg-white p-6 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  )
}
