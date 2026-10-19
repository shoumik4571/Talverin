'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const TICKS = 24;
const CX = 80;
const CY = 80;

/**
 * RingProgress — 160px SVG: 24 tick marks, zinc track, motion.circle arc
 * animating pathLength 0 → 0.78, with a spring-driven count in sync.
 */
export function RingProgress({ className = '' }: { className?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    const controls = animate(count, 78, { type: 'spring', stiffness: 60, damping: 16 });
    return () => controls.stop();
  }, [count]);

  const polar = (r: number, deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-[#FAFAFA] p-6 ${className}`}>
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {Array.from({ length: TICKS }).map((_, i) => {
            const long = i % 6 === 0;
            const p1 = polar(long ? 58 : 60, i * 15);
            const p2 = polar(66, i * 15);
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#d4d4d8"
                strokeWidth={1}
              />
            );
          })}
          <circle cx={CX} cy={CY} r={52} fill="none" stroke="#e4e4e7" strokeWidth={6} />
          <motion.circle
            cx={CX}
            cy={CY}
            r={52}
            fill="none"
            stroke="#09090b"
            strokeWidth={6}
            strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.78 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          />
        </svg>
        <motion.span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold tabular-nums text-zinc-950">
          {rounded}
        </motion.span>
      </div>
    </div>
  );
}
