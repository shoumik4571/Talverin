import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
  shimmerWidth?: number
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={
        {
          '--shiny-width': `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        'animate-shiny-text mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70',
        'bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',
        'bg-gradient-to-r from-transparent via-black via-50% to-transparent dark:via-white dark:via-50% dark:to-transparent',
        className,
      )}
    >
      {children}
    </span>
  )
}
