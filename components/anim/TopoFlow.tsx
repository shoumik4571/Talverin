'use client';

import { useEffect, useRef } from 'react';

const GRID = 10;
const LEVELS = 9;
const SIGMA = 110;
const HILL_AMP = 0.9;

function baseH(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.011 + t * 0.16) * Math.cos(y * 0.013 - t * 0.11) +
    0.6 * Math.sin((x + y) * 0.007 + t * 0.23) +
    0.4 * Math.cos((x - y) * 0.009 - t * 0.19)
  );
}

type Pt = { x: number; y: number };

function edgePt(a: Pt, va: number, b: Pt, vb: number, t: number): Pt {
  const s = (t - va) / (vb - va);
  return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
}

function seg(ctx: CanvasRenderingContext2D, p: Pt, q: Pt) {
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(q.x, q.y);
}

/**
 * TopoFlow — living topographic map. Analytic pseudo-noise height field
 * plus a cursor hill, contoured every frame with marching squares.
 */
export function TopoFlow({ className = '' }: { className?: string }) {
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
    let last = performance.now();
    const mouse = { x: 0, y: 0, sx: 0, sy: 0, inside: false, amp: 0 };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    const frame = (now: number) => {
      if (!running) return;
      last = now;
      const t = now / 1000;

      mouse.sx += (mouse.x - mouse.sx) * 0.1;
      mouse.sy += (mouse.y - mouse.sy) * 0.1;
      mouse.amp += ((mouse.inside ? HILL_AMP : 0) - mouse.amp) * 0.1;

      const cols = Math.ceil(w / GRID);
      const rows = Math.ceil(h / GRID);
      const f = new Float32Array((cols + 1) * (rows + 1));
      let mn = Infinity;
      let mx = -Infinity;
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const x = i * GRID;
          const y = j * GRID;
          let v = baseH(x, y, t);
          if (mouse.amp > 0.001) {
            const dx = x - mouse.sx;
            const dy = y - mouse.sy;
            v += mouse.amp * Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA));
          }
          f[j * (cols + 1) + i] = v;
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      for (let L = 0; L < LEVELS; L++) {
        const th = mn + ((mx - mn) * (L + 1)) / (LEVELS + 1);
        const isIndex = L % 3 === 2;
        ctx.strokeStyle = `rgba(63,63,70,${isIndex ? 0.28 : (0.05 + (0.17 * L) / (LEVELS - 1)).toFixed(3)})`;
        ctx.lineWidth = isIndex ? 1.2 : 1;
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const v0 = f[j * (cols + 1) + i];
            const v1 = f[j * (cols + 1) + i + 1];
            const v2 = f[(j + 1) * (cols + 1) + i + 1];
            const v3 = f[(j + 1) * (cols + 1) + i];
            let idx = 0;
            if (v0 > th) idx |= 8;
            if (v1 > th) idx |= 4;
            if (v2 > th) idx |= 2;
            if (v3 > th) idx |= 1;
            if (idx === 0 || idx === 15) continue;
            const x = i * GRID;
            const y = j * GRID;
            const A = { x, y };
            const B = { x: x + GRID, y };
            const C = { x: x + GRID, y: y + GRID };
            const D = { x, y: y + GRID };
            const pT = edgePt(A, v0, B, v1, th);
            const pR = edgePt(B, v1, C, v2, th);
            const pB = edgePt(D, v3, C, v2, th);
            const pL = edgePt(A, v0, D, v3, th);
            switch (idx) {
              case 1:
              case 14:
                seg(ctx, pL, pB);
                break;
              case 2:
              case 13:
                seg(ctx, pR, pB);
                break;
              case 3:
              case 12:
                seg(ctx, pL, pR);
                break;
              case 4:
              case 11:
                seg(ctx, pT, pR);
                break;
              case 6:
              case 9:
                seg(ctx, pT, pB);
                break;
              case 7:
              case 8:
                seg(ctx, pT, pL);
                break;
              case 5:
                seg(ctx, pT, pL);
                seg(ctx, pR, pB);
                break;
              case 10:
                seg(ctx, pT, pR);
                seg(ctx, pB, pL);
                break;
            }
          }
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden bg-white ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
