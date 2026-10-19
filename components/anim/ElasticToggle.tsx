'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

/**
 * ElasticToggle — 56×32 switch; knob slides on a spring and stretches
 * mid-travel (scaleX/Y keyframes); sun/moon crossfade inside the knob.
 */
export function ElasticToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(false);
  const stretch = useAnimationControls();

  const toggle = () => {
    setOn((v) => !v);
    void stretch.start({
      scaleX: [1, 1.4, 1],
      scaleY: [1, 0.78, 1],
      transition: { duration: 0.45, times: [0, 0.45, 1], ease: 'easeOut' },
    });
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-[#FAFAFA] p-6 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Elastic toggle"
        onClick={toggle}
        className="outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
      >
        <motion.span
          animate={{ backgroundColor: on ? '#09090b' : '#e4e4e7' }}
          transition={{ duration: 0.25 }}
          className="block h-8 w-14 rounded-full p-1"
        >
          <motion.span
            animate={{ x: on ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="block size-6"
          >
            <motion.span
              animate={stretch}
              className="relative flex size-6 items-center justify-center rounded-full bg-white shadow-sm"
            >
              <motion.span
                animate={{ opacity: on ? 0 : 1, scale: on ? 0.5 : 1, rotate: on ? -90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center text-zinc-500"
              >
                <Sun size={12} strokeWidth={2.5} />
              </motion.span>
              <motion.span
                animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.5, rotate: on ? 0 : 90 }}
                transition={{ duration: 0.2 }}
                className="absolute flex items-center justify-center text-zinc-950"
              >
                <Moon size={12} strokeWidth={2.5} />
              </motion.span>
            </motion.span>
          </motion.span>
        </motion.span>
      </button>
    </div>
  );
}
