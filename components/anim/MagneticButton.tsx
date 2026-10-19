'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type MouseEvent, type ReactNode } from 'react';

const RADIUS = 80;
const MAX_PULL = 16;

/**
 * MagneticButton — pill translates toward the cursor within 80px
 * (max 16px pull, spring 180/14); label follows at 0.4x for parallax.
 * Listeners live on the padded wrapper, never on window.
 */
export function MagneticButton({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14 });
  const sy = useSpring(y, { stiffness: 180, damping: 14 });
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const slx = useSpring(lx, { stiffness: 180, damping: 14 });
  const sly = useSpring(ly, { stiffness: 180, damping: 14 });

  const reset = () => {
    x.set(0);
    y.set(0);
    lx.set(0);
    ly.set(0);
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist >= RADIUS || dist < 0.5) {
      reset();
      return;
    }
    const mag = MAX_PULL * (1 - dist / RADIUS);
    const nx = (dx / dist) * mag;
    const ny = (dy / dist) * mag;
    x.set(nx);
    y.set(ny);
    lx.set(nx * 0.4);
    ly.set(ny * 0.4);
  };

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={reset} className="inline-block p-20 -m-20">
      <motion.div
        style={{ x: sx, y: sy }}
        className={`inline-flex cursor-pointer items-center rounded-full bg-gradient-to-b from-[#18D2A6] to-[#0E8A6D] px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(17,166,131,0.35)] ${className}`}
      >
        <motion.span style={{ x: slx, y: sly }} className="inline-flex items-center gap-2">
          {children}
        </motion.span>
      </motion.div>
    </div>
  );
}
