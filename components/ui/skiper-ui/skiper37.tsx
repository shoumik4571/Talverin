"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const SkiperAnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) => {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState<string>(value.toFixed(decimals));

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.65,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(latest.toFixed(decimals));
      },
    });
    return () => controls.stop();
  }, [value, decimals, motionVal]);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export const SkiperMorphPlayPauseButton = ({
  isPaused,
  onTogglePause,
  onReset,
  className = "",
}: {
  isPaused: boolean;
  onTogglePause: () => void;
  onReset?: () => void;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-fit items-center gap-2", className)}>
      <motion.button
        type="button"
        aria-label={isPaused ? "Resume timer" : "Pause timer"}
        onClick={onTogglePause}
        whileTap={{ scale: 0.9 }}
        className="flex size-9 items-center justify-center rounded-full bg-[#15C39A] text-slate-950 shadow-md transition-colors hover:bg-[#19d6a9]"
      >
        <AnimatePresence initial={false} mode="wait">
          {isPaused ? (
            <motion.svg
              key="play"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ duration: 0.12 }}
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-3.5 fill-current"
            >
              <path d="M0.9375 13.2422C1.25 13.2422 1.51562 13.1172 1.82812 12.9375L10.9375 7.67188C11.5859 7.28906 11.8125 7.03906 11.8125 6.625C11.8125 6.21094 11.5859 5.96094 10.9375 5.58594L1.82812 0.3125C1.51562 0.132812 1.25 0.015625 0.9375 0.015625C0.359375 0.015625 0 0.453125 0 1.13281V12.1172C0 12.7969 0.359375 13.2422 0.9375 13.2422Z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="pause"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ duration: 0.12 }}
              viewBox="0 0 10 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-3.5 fill-current"
            >
              <path d="M1.03906 12.7266H2.82031C3.5 12.7266 3.85938 12.3672 3.85938 11.6797V1.03906C3.85938 0.328125 3.5 0 2.82031 0H1.03906C0.359375 0 0 0.359375 0 1.03906V11.6797C0 12.3672 0.359375 12.7266 1.03906 12.7266ZM6.71875 12.7266H8.49219C9.17969 12.7266 9.53125 12.3672 9.53125 11.6797V1.03906C9.53125 0.328125 9.17969 0 8.49219 0H6.71875C6.03125 0 5.67188 0.359375 5.67188 1.03906V11.6797C5.67188 12.3672 6.03125 12.7266 6.71875 12.7266Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
      {onReset && (
        <button
          type="button"
          aria-label="Reset timer"
          onClick={onReset}
          title="Reset 90m Focus Timer"
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <Plus className="size-4 rotate-45" />
        </button>
      )}
    </div>
  );
};
