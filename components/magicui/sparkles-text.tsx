'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Sparkle {
  id: number
  x: string
  y: string
  size: number
  color: string
}

interface SparklesTextProps {
  children: ReactNode
  className?: string
  colors?: { first: string; second: string }
  sparklesCount?: number
}

const STAR_PATH =
  'M12 0c.7 6.5 5.5 11.3 12 12-6.5.7-11.3 5.5-12 12-.7-6.5-5.5-11.3-12-12C6.5 11.3 11.3 6.5 12 0z'

export function SparklesText({
  children,
  className,
  colors = { first: '#9E7AFF', second: '#FE8BBB' },
  sparklesCount = 10,
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const id = ++idRef.current
      const color = Math.random() > 0.5 ? colors.first : colors.second
      const sparkle: Sparkle = {
        id,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: 8 + Math.random() * 12,
        color,
      }
      setSparkles((prev) => [...prev.slice(-(sparklesCount - 1)), sparkle])
      window.setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id))
      }, 900)
    }, 350)
    return () => window.clearInterval(interval)
  }, [colors.first, colors.second, sparklesCount])

  return (
    <span className={cn('relative inline-block', className)}>
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 90 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="pointer-events-none absolute"
          style={{ left: s.x, top: s.y }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill={s.color}>
            <path d={STAR_PATH} />
          </svg>
        </motion.span>
      ))}
      <span className="relative z-10">{children}</span>
    </span>
  )
}
