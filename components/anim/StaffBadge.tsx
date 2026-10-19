'use client';

import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type DragState = { active: boolean; x: number };

function makeBadgeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 320;
  const g = c.getContext('2d')!;

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };

  g.fillStyle = '#ffffff';
  roundRect(4, 4, 504, 312, 30);
  g.fill();
  g.strokeStyle = '#d4d4d8';
  g.lineWidth = 2;
  g.stroke();

  // clip hole + ring
  g.fillStyle = '#18181b';
  g.beginPath();
  g.arc(256, 30, 12, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#a1a1aa';
  g.lineWidth = 2.5;
  g.beginPath();
  g.arc(256, 30, 18, 0, Math.PI * 2);
  g.stroke();

  // grey avatar placeholder
  g.fillStyle = '#e4e4e7';
  g.beginPath();
  g.arc(108, 168, 54, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#a1a1aa';
  g.beginPath();
  g.arc(108, 152, 20, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(108, 208, 30, Math.PI, 0);
  g.fill();

  // STAFF + subtitle
  g.fillStyle = '#09090b';
  g.font = '700 62px "JetBrains Mono", monospace';
  g.textBaseline = 'alphabetic';
  g.fillText('STAFF', 188, 152);
  g.fillStyle = '#71717a';
  g.font = '500 22px "JetBrains Mono", monospace';
  g.fillText('MOTIONVAULT / N°034', 190, 192);

  // barcode strip
  let seed = 34;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  let bx = 190;
  g.fillStyle = '#09090b';
  while (bx < 462) {
    const bw = 2 + Math.floor(rand() * 7);
    if (rand() > 0.35) g.fillRect(bx, 232, bw, 52);
    bx += bw + 2 + Math.floor(rand() * 5);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function BadgeRig({ drag }: { drag: { current: DragState } }) {
  const pivot = useRef<THREE.Group>(null!);
  const st = useRef({ th: 0.3, om: 0, tilt: 0 });
  const tex = useMemo(makeBadgeTexture, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(0.033, rawDt);
    const d = drag.current;
    const k = d.active ? 34 : 9;
    const c = d.active ? 9 : 0.55;
    const target = d.active ? Math.max(-1.15, Math.min(1.15, d.x * 1.3)) : 0;
    st.current.om += (-k * (st.current.th - target) - c * st.current.om) * dt;
    st.current.th += st.current.om * dt;
    pivot.current.rotation.z = st.current.th;
    const tiltTarget = d.active ? d.x * 0.3 : 0;
    st.current.tilt += (tiltTarget - st.current.tilt) * Math.min(1, dt * 8);
    pivot.current.rotation.y = st.current.tilt;
  });

  return (
    <group position={[0, 1.55, 0]} ref={pivot}>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 1.7, 12]} />
        <meshBasicMaterial color="#71717a" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#52525b" />
      </mesh>
      <mesh position={[0, -2.06, 0]}>
        <planeGeometry args={[1.36, 0.85]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * StaffBadge — hanging R3F badge on #FAFAFA. Drag it (pointer capture on
 * the wrapper); release for a loose underdamped swing back to center.
 */
export function StaffBadge({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>({ active: false, x: 0 });

  const setX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current.x = ((clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current.active = true;
    setX(e.clientX);
    if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing';
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current.active) setX(e.clientX);
  };
  const up = () => {
    drag.current.active = false;
    if (wrapRef.current) wrapRef.current.style.cursor = 'grab';
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      style={{ touchAction: 'none', cursor: 'grab' }}
      className={`relative overflow-hidden ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0.1, 4.2], fov: 42 }}
        dpr={[1, 2]}
        style={{ background: '#FAFAFA' }}
        gl={{ antialias: true, alpha: false }}
      >
        <BadgeRig drag={drag} />
      </Canvas>
    </div>
  );
}
