"use client";

import { motion } from "framer-motion";
import React from "react";

import { cn } from "@/lib/utils";

export const Bracket = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 27 78"
      className={cn("h-5 w-auto fill-current", className)}
    >
      <path d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z" />
    </svg>
  );
};

export const SkiperBracketBadge = ({
  children,
  className = "",
  bracketClassName = "text-[#11A683]",
}: {
  children: React.ReactNode;
  className?: string;
  bracketClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0E8A6D]",
        className,
      )}
    >
      <Bracket className={cn("h-4", bracketClassName)} />
      <span>{children}</span>
      <Bracket className={cn("h-4 scale-x-[-1]", bracketClassName)} />
    </div>
  );
};

export const SkiperPerspectiveHeading = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  const words = text.split(" ");
  const centerIndex = Math.floor(words.length / 2);

  return (
    <h1
      className={cn(
        "flex flex-wrap items-center gap-x-2 text-3xl font-extrabold tracking-tight text-slate-900",
        className,
      )}
      style={{ perspective: "600px" }}
    >
      {words.map((word, index) => {
        const dist = index - centerIndex;
        return (
          <motion.span
            key={`${word}-${index}`}
            initial={{
              opacity: 0,
              x: dist * 16,
              rotateX: dist * 18,
              y: 8,
            }}
            animate={{
              opacity: 1,
              x: 0,
              rotateX: 0,
              y: 0,
            }}
            transition={{
              duration: 0.42,
              delay: index * 0.035,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        );
      })}
    </h1>
  );
};
