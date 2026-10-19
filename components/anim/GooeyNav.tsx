'use client';

import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useState } from 'react';

const LABELS = ['首页', '作品', '文章', '关于'];
const CELL = 78;
const PILL_W = 70;
const PILL_H = 32;

/**
 * GooeyNav — pill nav with a gooey indicator that smears with velocity
 * plus a lagging trailer blob, fused through an SVG goo filter.
 */
export function GooeyNav({ className = '' }: { className?: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const x = useMotionValue(0);
  const vx = useVelocity(x);
  const stretchX = useTransform(vx, (v) => 1 + Math.min(Math.abs(v) / 900, 0.55));
  const tailX = useSpring(x, { stiffness: 90, damping: 14 });
  const tailSquash = useTransform(vx, (v) => Math.max(0.35, 1 - Math.abs(v) / 2200));

  const go = (i: number) => {
    setActiveIdx(i);
    void animate(x, i * CELL, { type: 'spring', stiffness: 300, damping: 24 });
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-zinc-100 p-6 ${className}`}>
      <div className="relative rounded-full border border-zinc-200 bg-white p-1">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <filter id="gooeyNavFilter">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
        <div className="absolute inset-0 z-0" style={{ filter: 'url(#gooeyNavFilter)' }}>
          <motion.div
            style={{ x, scaleX: stretchX, left: 4 + 4, top: 4, width: PILL_W, height: PILL_H }}
            className="absolute rounded-lg bg-zinc-950"
          />
          <motion.div
            style={{ x: tailX, scaleY: tailSquash, left: 4 + 19, top: 4 + 6, width: 32, height: 20 }}
            className="absolute rounded-full bg-zinc-950"
          />
        </div>
        <div className="relative z-10 flex">
          {LABELS.map((label, i) => (
            <motion.button
              key={label}
              type="button"
              onClick={() => go(i)}
              animate={{ color: i === activeIdx ? '#FAFAFA' : '#52525B' }}
              transition={{ duration: 0.25 }}
              style={{ width: CELL, height: PILL_H }}
              className="flex items-center justify-center text-[13px] font-medium"
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
