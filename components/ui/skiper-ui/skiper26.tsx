"use client";

import React, { useCallback } from "react";
import { ThemeToggleButton2 } from "@/components/ui/skiper-ui/skiper4";

export type AnimationVariant = "circle" | "rectangle" | "polygon";
export type AnimationStart =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "bottom-up"
  | "top-down";

export function triggerSkiperViewTransition(
  callback: () => void,
  variant: AnimationVariant = "circle",
  start: AnimationStart = "top-right",
) {
  if (typeof window === "undefined") {
    callback();
    return;
  }

  const styleId = "skiper26-view-transition-styles";
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  const clipOrigin =
    start === "top-right"
      ? "92% 6%"
      : start === "top-left"
        ? "8% 6%"
        : "50% 50%";

  styleEl.textContent =
    variant === "polygon"
      ? `
      ::view-transition-group(root) {
        animation-duration: 0.55s;
        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      }
      ::view-transition-new(root) {
        animation-name: skiper-reveal-polygon;
      }
      ::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      @keyframes skiper-reveal-polygon {
        from { clip-path: polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%); }
        to { clip-path: polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%); }
      }
    `
      : `
      ::view-transition-group(root) {
        animation-duration: 0.6s;
        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      }
      ::view-transition-new(root) {
        animation-name: skiper-reveal-circle;
      }
      ::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      @keyframes skiper-reveal-circle {
        from { clip-path: circle(0% at ${clipOrigin}); }
        to { clip-path: circle(150% at ${clipOrigin}); }
      }
    `;

  const docWithVT = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (typeof docWithVT.startViewTransition === "function") {
    docWithVT.startViewTransition(callback);
  } else {
    callback();
  }
}

export const Skiper26ThemeToggle = ({
  isDark,
  onToggle,
  variant = "circle",
  className = "size-9 p-2",
}: {
  isDark: boolean;
  onToggle: () => void;
  variant?: AnimationVariant;
  className?: string;
}) => {
  const handleToggle = useCallback(() => {
    triggerSkiperViewTransition(onToggle, variant, "top-right");
  }, [onToggle, variant]);

  return (
    <ThemeToggleButton2
      isDark={isDark}
      onToggle={handleToggle}
      className={className}
      title="Skiper 26 View-Transition Studio Mode"
    />
  );
};
