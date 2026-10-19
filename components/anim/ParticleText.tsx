'use client';

import { useEffect, useRef } from 'react';

type Particle = { x: number; y: number; vx: number; vy: number; tx: number; ty: number };

/**
 * ParticleText — word sampled into ~1500 target points; particles spring
 * home and scatter from the cursor. White 1.2px dots on dark.
 */
export function ParticleText({ word = 'MOTION', className = '' }: { word?: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let running = true;
    let pts: Particle[] = [];
    const mouse = { x: -9999, y: -9999, inside: false };

    const build = () => {
      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;
      octx.font = '700 120px Inter, system-ui, sans-serif';
      const tw = Math.max(1, octx.measureText(word).width);
      const scale = Math.min(1, (w * 0.86) / tw, (h * 0.62) / 120);
      off.width = Math.max(1, Math.round(w));
      off.height = Math.max(1, Math.round(h));
      octx.font = `700 ${Math.max(8, 120 * scale)}px Inter, system-ui, sans-serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = '#fff';
      octx.fillText(word, off.width / 2, off.height / 2);
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const targets: Array<{ x: number; y: number }> = [];
      const step = 4;
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) targets.push({ x, y });
        }
      }
      const stride = Math.max(1, Math.floor(targets.length / 1500));
      pts = targets
        .filter((_, i) => i % stride === 0)
        .slice(0, 1600)
        .map((t) => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          tx: t.x,
          ty: t.y,
        }));
    };

    let resizeTimer = 0;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.inside = true;
    };
    const onLeave = () => {
      mouse.inside = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    const frame = () => {
      if (!running) return;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      for (const p of pts) {
        p.vx += (p.tx - p.x) * 0.06;
        p.vy += (p.ty - p.y) * 0.06;
        if (mouse.inside) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 60 && d > 0.01) {
            const f = 8 * (1 - d / 60);
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillRect(p.x, p.y, 1.2, 1.2);
      }
      raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [word]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-zinc-950 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
