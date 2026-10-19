import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit'
}

export const ShimmerButton = ({
  shimmerColor = '#ffffff',
  shimmerSize = '0.05em',
  shimmerDuration = '3s',
  borderRadius = '100px',
  background = 'radial-gradient(ellipse 80% 50% at 50% 120%,rgba(62, 172, 199, 0.5),rgba(142, 61, 255,0.5)), #070510',
  className,
  children,
  onClick,
  type = 'button',
}: ShimmerButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as CSSProperties
      }
      className={cn(
        'group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-white/10 px-6 py-[13px] text-white [background:var(--bg)] [border-radius:var(--radius)]',
        'transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px',
        className,
      )}
    >
      <div
        className={cn(
          '-z-30 blur-[2px]',
          'absolute inset-0 overflow-visible [container-type:size]',
        )}
      >
        <div className="animate-shimmer-slide absolute inset-0 h-[100cqh] w-[100cqw] [animation-duration:var(--speed,3s)] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
      </div>
      {children}
      <div className="insert-0 absolute size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]">
        <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/5 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div
        className={cn(
          'absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]',
        )}
      />
    </button>
  )
}
