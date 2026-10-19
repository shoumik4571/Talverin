'use client'

import { useEffect, useRef, useState, type ReactNode, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

type MouseRef = MutableRefObject<{ x: number; y: number }>

/** Parallax camera rig: eases the whole scene toward the cursor. */
function ParallaxRig({ children, mouse }: { children: ReactNode; mouse: MouseRef }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const g = ref.current
    g.rotation.x +=
      (mouse.current.y * 0.32 + Math.sin(t * 0.12) * 0.04 - g.rotation.x) * 0.045
    g.rotation.y += (mouse.current.x * 0.5 + t * 0.02 - g.rotation.y) * 0.045
  })

  return <group ref={ref}>{children}</group>
}

/** Morphing icosahedron shell + counter-rotating octahedron core. */
function HeroGeometry({ dark }: { dark: boolean }) {
  const shell = useRef<THREE.Mesh>(null!)
  const core = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    shell.current.rotation.y += d * 0.16
    shell.current.rotation.x += d * 0.05
    core.current.rotation.y -= d * 0.3
    core.current.rotation.z += d * 0.12
  })

  return (
    <Float speed={1.7} rotationIntensity={0.22} floatIntensity={0.75}>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.65, 1]} />
        <MeshDistortMaterial
          color={dark ? '#2ce0aa' : '#0e8a6d'}
          wireframe
          transparent
          opacity={dark ? 0.5 : 0.32}
          distort={0.3}
          speed={1.5}
          roughness={0}
          metalness={0}
        />
      </mesh>
      <mesh ref={core}>
        <octahedronGeometry args={[0.78, 0]} />
        <meshBasicMaterial
          color={dark ? '#7df0c8' : '#11a683'}
          wireframe
          transparent
          opacity={dark ? 0.7 : 0.5}
        />
      </mesh>
    </Float>
  )
}

/** Dual tilted orbit rings with different spin directions. */
function OrbitRings({ dark }: { dark: boolean }) {
  const r1 = useRef<THREE.Mesh>(null!)
  const r2 = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05)
    r1.current.rotation.z += d * 0.22
    r2.current.rotation.z -= d * 0.14
  })

  return (
    <>
      <mesh ref={r1} rotation={[Math.PI / 2.4, 0.3, 0]}>
        <torusGeometry args={[2.55, 0.008, 8, 180]} />
        <meshBasicMaterial
          color={dark ? '#818cf8' : '#4f46e5'}
          transparent
          opacity={dark ? 0.5 : 0.32}
        />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 1.7, -0.4, 0.2]}>
        <torusGeometry args={[2.95, 0.006, 8, 180]} />
        <meshBasicMaterial
          color={dark ? '#2ce0aa' : '#0e8a6d'}
          transparent
          opacity={dark ? 0.4 : 0.24}
        />
      </mesh>
    </>
  )
}

function Scene({
  dark,
  density,
  mouse,
}: {
  dark: boolean
  density: number
  mouse: MouseRef
}) {
  return (
    <>
      <ParallaxRig mouse={mouse}>
        <HeroGeometry dark={dark} />
        <OrbitRings dark={dark} />
        <Sparkles
          count={Math.round(90 * density)}
          scale={[9, 7, 5]}
          size={2.6}
          speed={0.25}
          color={dark ? '#5eeabb' : '#0e8a6d'}
          opacity={dark ? 0.65 : 0.45}
        />
        <Sparkles
          count={Math.round(40 * density)}
          scale={[12, 9, 6]}
          size={5}
          speed={0.12}
          color={dark ? '#a5b4fc' : '#6366f1'}
          opacity={dark ? 0.4 : 0.25}
        />
      </ParallaxRig>
    </>
  )
}

/**
 * SpatialScene — react-three-fiber 3D backdrop. Rendered client-only
 * (imported via next/dynamic with ssr:false in GeometryBackdrop).
 */
export default function SpatialScene({
  dark = false,
  density = 1,
  interactive = true,
}: {
  dark?: boolean
  density?: number
  interactive?: boolean
}) {
  const mouse = useRef({ x: 0, y: 0 })
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [loop, setLoop] = useState<'always' | 'never'>(reduced ? 'never' : 'always')

  // Pause everything offscreen: the R3F loop and the cursor-smoothing loop.
  useEffect(() => {
    if (reduced) return
    const onVis = () => setLoop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [reduced])

  // Window-level cursor tracking (canvas is pointer-events-none by design).
  useEffect(() => {
    if (!interactive || reduced) return
    let raf = 0
    const target = { x: 0, y: 0 }
    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = -((e.clientY / window.innerHeight - 0.5) * 2)
    }
    const tick = () => {
      mouse.current.x += (target.x - mouse.current.x) * 0.06
      mouse.current.y += (target.y - mouse.current.y) * 0.06
      raf = requestAnimationFrame(tick)
    }
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        raf = requestAnimationFrame(tick)
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      cancelAnimationFrame(raf)
    }
  }, [interactive, reduced])

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={loop}
      style={{ background: 'transparent' }}
    >
      <Scene dark={dark} density={density} mouse={mouse} />
    </Canvas>
  )
}
