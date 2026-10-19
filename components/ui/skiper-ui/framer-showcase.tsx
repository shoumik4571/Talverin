"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 3D Interactive Mouse-Tracking Spring Tilt Card powered by Framer Motion
 * Uses useMotionValue + useSpring + useTransform + useMotionTemplate
 */
export function FramerTiltCard({
  children,
  className = "",
  onClick,
  isSelected = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 320, damping: 24, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [5, -5]);
  const rotateY = useTransform(smoothX, [0, 1], [-5, 5]);

  const spotX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const spotY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${spotX} ${spotY}, rgba(21, 195, 154, 0.16), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      layout
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.015, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative cursor-pointer select-none overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      {isSelected && (
        <motion.div
          layoutId="framer-selected-card-outline"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl border-2 border-[#15C39A]"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * Staggered Spring Container & Item variants for cascading Framer Motion lists
 */
export const springStaggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

export const springStaggerItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 24,
    },
  },
};

/**
 * Animated Framer Motion Spring Stepper & Progress Bar for the 5-Question Flow + Personalized OS
 */
export function FramerSpringProgressBar({
  step,
  onSelectStep,
  hasPlan,
}: {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  onSelectStep: (s: 1 | 2 | 3 | 4 | 5 | 6) => void;
  hasPlan: boolean;
}) {
  const steps = [
    { n: 1 as const, title: "Q1. Name" },
    { n: 2 as const, title: "Q2. Role" },
    { n: 3 as const, title: "Q3. Daily Hours" },
    { n: 4 as const, title: "Q4. Goals" },
    { n: 5 as const, title: "Q5. Deadlines" },
    { n: 6 as const, title: "Personalized OS" },
  ];

  const progressPct = ((step - 1) / 5) * 100;

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {steps.map((s) => {
          const isCurrent = step === s.n;
          const isDone = step > s.n;
          return (
            <motion.button
              key={s.n}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (s.n === 6 && !hasPlan) return;
                onSelectStep(s.n);
              }}
              className={cn(
                "relative flex-1 cursor-pointer rounded-xl px-2.5 py-2 text-xs font-extrabold transition-colors",
                isCurrent
                  ? "text-white"
                  : isDone
                    ? "text-[#0E8A6D] hover:bg-emerald-50"
                    : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {isCurrent && (
                <motion.div
                  layoutId="framer-top-step-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="absolute inset-0 rounded-xl bg-[#0F1F1C] shadow-md"
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap">
                {isDone && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="inline-flex size-4 items-center justify-center rounded-full bg-[#15C39A] text-slate-950"
                  >
                    <Check className="size-2.5 stroke-[3]" />
                  </motion.span>
                )}
                {s.title}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Spring-animated progress track */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0F1F1C] via-[#11A683] to-[#15C39A]"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(10, progressPct)}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        />
      </div>
    </div>
  );
}
