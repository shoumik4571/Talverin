import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: string | string[]
  className?: string
  children: ReactNode
}

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = '#000000',
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          '--border-radius': `${borderRadius}px`,
        } as CSSProperties
      }
      className={cn(
        'relative grid min-h-[60px] w-fit min-w-[300px] place-items-center rounded-[var(--border-radius)] bg-white p-3 text-black dark:bg-black dark:text-white',
        className,
      )}
    >
      <div
        style={
          {
            '--border-width': `${borderWidth}px`,
            '--duration': `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${
              Array.isArray(color) ? color.join(',') : color
            },transparent,transparent)`,
            backgroundSize: '300% 300%',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 'var(--border-width)',
          } as CSSProperties
        }
        className={cn(
          'animate-shine pointer-events-none absolute inset-0 size-full rounded-[var(--border-radius)] will-change-[background-position]',
        )}
      />
      {children}
    </div>
  )
}
