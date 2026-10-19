'use client'

import dynamic from 'next/dynamic'

const SpatialScene = dynamic(() => import('@/components/spatial-scene'), {
  ssr: false,
})

type GeometryBackdropProps = {
  dark?: boolean
  density?: number
  interactive?: boolean
  className?: string
}

/**
 * GeometryBackdrop — live react-three-fiber 3D backdrop
 * (morphing icosahedron + octahedron core + orbit rings + sparkles).
 * Same props API as before; scene loads client-only.
 */
export default function GeometryBackdrop({
  dark = false,
  density = 1,
  interactive = true,
  className = '',
}: GeometryBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <SpatialScene dark={dark} density={density} interactive={interactive} />
    </div>
  )
}
