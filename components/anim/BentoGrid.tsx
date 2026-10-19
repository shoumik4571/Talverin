'use client';

import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { InViewCounter } from './InViewCounter';

const CHUNKS = [
  { text: 'TAL', bg: 'bg-lime-300', fg: 'text-zinc-950' },
  { text: 'VER', bg: 'bg-zinc-950', fg: 'text-white' },
  { text: 'IN', bg: 'bg-violet-500', fg: 'text-white' },
];

const item = {
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.09 * i },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -44,
    scale: 0.97,
    transition: { duration: 0.4, ease: 'easeIn' as const, delay: 0.06 * i },
  }),
};

function Wrap({ i, className = '', children }: { i: number; className?: string; children: ReactNode }) {
  return (
    <motion.div custom={i} variants={item} className={className}>
      {children}
    </motion.div>
  );
}

function DemoLabel({ children }: { children: string }) {
  return (
    <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
      {children}
    </span>
  );
}

function ToggleDemo() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), 700);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div>
      <DemoLabel>Toggle</DemoLabel>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors duration-300 ${on ? 'justify-end bg-emerald-500' : 'justify-start bg-zinc-200'}`}
      >
        <motion.span layout className="size-5 rounded-full bg-white shadow" transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </button>
    </div>
  );
}

function ChartDemo() {
  return (
    <div>
      <DemoLabel>Draw on</DemoLabel>
      <svg viewBox="0 0 200 64" className="h-16 w-full">
        <motion.path
          d="M4,52 C40,52 52,20 84,24 C116,28 128,48 160,40 C176,36 188,28 196,22"
          fill="none"
          stroke="#0e8a6d"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
    </div>
  );
}

function TimelineDemo() {
  return (
    <div>
      <DemoLabel>Playhead</DemoLabel>
      <div className="relative mt-5 h-8">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-200" />
        {[0.1, 0.38, 0.64, 0.88].map((p, i) => (
          <span
            key={i}
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-emerald-500"
            style={{ left: `${p * 100}%` }}
          />
        ))}
        <motion.span
          animate={{ left: ['0%', '100%', '0%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950"
        />
      </div>
    </div>
  );
}

function RingDemo() {
  return (
    <div>
      <DemoLabel>Ring</DemoLabel>
      <svg viewBox="0 0 48 48" className="size-12">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#e4e4e7" strokeWidth="5" />
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#0e8a6d"
          strokeWidth="5"
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 0.72 }}
          viewport={{ amount: 0.6 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}

/**
 * BentoGrid — off-white bento spelling TALVERIN across lime / ink /
 * violet cards; feature-demo tiles spring in, hold, lift away, loop.
 */
export function BentoGrid({ className = '' }: { className?: string }) {
  const [cycle, setCycle] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 3000);
    const t2 = window.setTimeout(() => {
      setLeaving(false);
      setCycle((c) => c + 1);
    }, 3900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cycle]);

  const card =
    'h-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]';
  const span = 'col-span-2 md:col-span-2';

  return (
    <div className={`rounded-3xl bg-[#FAFAFA] p-3 text-zinc-950 sm:p-4 ${className}`}>
      <motion.div
        key={cycle}
        initial="hidden"
        animate={leaving ? 'exit' : 'show'}
        className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4"
      >
        <Wrap i={0} className={span}>
          <div className={card}>
            <ToggleDemo />
          </div>
        </Wrap>
        <Wrap i={1} className={span}>
          <div className={card}>
            <ChartDemo />
          </div>
        </Wrap>
        <Wrap i={2} className={span}>
          <div className={card}>
            <DemoLabel>Stat</DemoLabel>
            <InViewCounter to={98} suffix="%" className="font-mono text-4xl font-bold tabular-nums text-zinc-950" />
          </div>
        </Wrap>
        {CHUNKS.map((c, k) => (
          <Wrap key={c.text} i={3 + k} className={span}>
            <div className={`overflow-hidden rounded-2xl ${c.bg} p-5`}>
              <div className="flex h-24 items-center justify-center overflow-hidden md:h-28">
                <motion.span
                  initial={{ y: '112%' }}
                  animate={{ y: leaving ? '112%' : '0%' }}
                  transition={{
                    type: 'spring',
                    stiffness: 240,
                    damping: 26,
                    delay: leaving ? 0.05 * k : 0.35 + 0.12 * k,
                  }}
                  className={`text-5xl font-black tracking-tighter md:text-6xl ${c.fg}`}
                >
                  {c.text}
                </motion.span>
              </div>
            </div>
          </Wrap>
        ))}
        <Wrap i={6} className={span}>
          <div className={card}>
            <DemoLabel>Dots</DemoLabel>
            <div className="flex items-center">
              {['bg-emerald-500', 'bg-indigo-500', 'bg-amber-400'].map((bg, j) => (
                <motion.span
                  key={bg}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.5 + j * 0.12 }}
                  className={`size-8 rounded-full ${bg} ${j > 0 ? '-ml-3 ring-2 ring-white' : ''}`}
                />
              ))}
            </div>
          </div>
        </Wrap>
        <Wrap i={7} className={span}>
          <div className={card}>
            <TimelineDemo />
          </div>
        </Wrap>
        <Wrap i={8} className={span}>
          <div className={`${card} flex items-center justify-between`}>
            <RingDemo />
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-white"
            >
              <RotateCw size={18} />
            </motion.span>
          </div>
        </Wrap>
      </motion.div>
    </div>
  );
}
