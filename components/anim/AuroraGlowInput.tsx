'use client';

import { useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';

export type AuroraPalette = 'boreal' | 'verdant' | 'violet';

const PALETTES: Record<AuroraPalette, { core2: string; core: string; blend: string; high: string }> = {
  boreal: { core2: '#0ea472', core: '#7cf5c4', blend: '#a78bfa', high: '#e8fff5' },
  verdant: { core2: '#0d9b5f', core: '#6ee7a0', blend: '#38bdf8', high: '#f0fdf4' },
  violet: { core2: '#6d4fc2', core: '#a78bfa', blend: '#f472b6', high: '#f5f0ff' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'sending' | 'done' | 'failed';

export function AuroraGlowInput({
  onJoin,
  label = 'Email address',
  placeholder = 'you@studio.com',
  cta = 'Join',
  done = 'Welcome in — check your inbox.',
  failed = 'That address looks off. Try again.',
  note = 'Early access · one email a month.',
  palette = 'boreal',
}: {
  onJoin: (address: string) => void | Promise<void>;
  label?: string;
  placeholder?: string;
  cta?: string;
  done?: string;
  failed?: string;
  note?: string;
  palette?: AuroraPalette;
}) {
  const pal = PALETTES[palette];
  const [status, setStatus] = useState<Status>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const rippleLayerRef = useRef<HTMLSpanElement>(null);
  const bloomRef = useRef<HTMLSpanElement>(null);

  // Shared 60s aurora clock: start where the clock already is so parts
  // mounted at different moments stay in step.
  const clockDelay = useMemo(() => {
    if (typeof performance === 'undefined') return '0s';
    return `${-((performance.now() / 1000) % 60)}s`;
  }, []);

  const reducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const spawnRipple = () => {
    const input = inputRef.current;
    const mirror = mirrorRef.current;
    const layer = rippleLayerRef.current;
    if (!input || !mirror || !layer || reducedMotion()) return;
    mirror.textContent = input.value.slice(0, input.selectionStart ?? input.value.length);
    const x = mirror.offsetWidth - input.scrollLeft + 22;
    const dot = document.createElement('span');
    dot.className = 'ag-ripple';
    dot.style.left = `${Math.max(22, x)}px`;
    layer.appendChild(dot);
    const anim = dot.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.25)', opacity: 0.9 },
        { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 },
      ],
      { duration: 260, easing: 'ease-out' },
    );
    anim.onfinish = () => dot.remove();
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 || e.key === 'Backspace') spawnRipple();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const address = (inputRef.current?.value || '').trim();
    if (!EMAIL_RE.test(address)) {
      setStatus('failed');
      return;
    }
    setStatus('sending');
    try {
      await onJoin(address);
      setStatus('done');
      const bloom = bloomRef.current;
      if (bloom && !reducedMotion()) {
        bloom.animate(
          [
            { opacity: 0.55, backgroundPosition: '0% 50%' },
            { opacity: 1, backgroundPosition: '50% 50%', offset: 0.5 },
            { opacity: 0.55, backgroundPosition: '100% 50%' },
          ],
          { duration: 600, easing: 'ease-out' },
        );
      }
    } catch {
      setStatus('failed');
    }
  };

  const line = status === 'done' ? done : status === 'failed' ? failed : status === 'sending' ? 'Sending…' : note;

  return (
    <form
      className="ag-root"
      style={{ '--ag-core2': pal.core2, '--ag-core': pal.core, '--ag-blend': pal.blend, '--ag-high': pal.high } as CSSProperties}
      onSubmit={handleSubmit}
      noValidate
    >
      <label className="ag-label" htmlFor="aurora-glow-input">
        {label}
      </label>
      <div className={`ag-field${status === 'failed' ? ' ag-failed' : ''}${status === 'done' ? ' ag-done' : ''}`}>
        <span ref={bloomRef} className="ag-bloom" style={{ animationDelay: clockDelay }} aria-hidden="true" />
        <span className="ag-rim" aria-hidden="true" />
        <span ref={rippleLayerRef} className="ag-ripples" aria-hidden="true" />
        <input
          ref={inputRef}
          id="aurora-glow-input"
          type="email"
          autoComplete="email"
          className="ag-input"
          placeholder={placeholder}
          disabled={status === 'sending'}
          onKeyUp={handleKeyUp}
        />
        <span ref={mirrorRef} className="ag-mirror" aria-hidden="true" />
        <button type="submit" className="ag-btn" disabled={status === 'sending'}>
          {status === 'sending' ? (
            <span className="ag-sending">
              <span className="ag-dot" aria-hidden="true" />
              Sending
            </span>
          ) : status === 'done' ? (
            'Done'
          ) : (
            cta
          )}
        </button>
      </div>
      <p className="ag-line" aria-live="polite">
        {line}
      </p>
    </form>
  );
}
