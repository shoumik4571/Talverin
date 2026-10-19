import type { ReactNode } from 'react';

/**
 * GlowCard — conic rotating border (25% indigo arc, 4s/rev, 2s on hover)
 * with a matching blurred glow behind it.
 */
export function GlowCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glow-card ${className}`}>
      <div className="glow-card-behind" aria-hidden="true" />
      <div className="relative rounded-[17px] bg-[#101014] p-6">{children}</div>
    </div>
  );
}
