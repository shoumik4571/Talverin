'use client';

import { useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

/**
 * InViewCounter — counts 0 → target over 2s with ease-out cubic when
 * mostly visible; resets to 0 on exit so re-scrolling replays it.
 */
export function InViewCounter({
  to,
  suffix = '',
  duration = 2,
  className = '',
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.8 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) {
      setVal(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }} className={className}>
      {val}
      {suffix}
    </span>
  );
}

export function InViewCounterDemo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 rounded-2xl bg-[#101014] p-6 text-center ${className}`}>
      <InViewCounter to={128} suffix="%" className="font-mono text-5xl font-bold tabular-nums text-white" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        replay on scroll
      </span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ amount: 0.8 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mt-2 h-1 w-24 origin-left rounded-full bg-[#15C39A]"
      />
    </div>
  );
}
