'use client'

import { cn } from '@/lib/utils'

interface SketchfabEmbedProps {
  /** Public Sketchfab model UID, e.g. "7w7pA0..." from the model's URL. */
  modelUid: string
  title?: string
  autostart?: boolean
  uiControls?: boolean
  className?: string
}

/**
 * SketchfabEmbed — drops any public Sketchfab model into the page via the
 * official Sketchfab Viewer iframe API. Paste a model UID to use it:
 *
 *   <SketchfabEmbed modelUid="PASTE_MODEL_UID_HERE" />
 */
export function SketchfabEmbed({
  modelUid,
  title = 'Sketchfab 3D model',
  autostart = true,
  uiControls = true,
  className,
}: SketchfabEmbedProps) {
  const params = new URLSearchParams({
    autostart: autostart ? '1' : '0',
    ui_controls: uiControls ? '1' : '0',
    ui_infos: '0',
  })

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl ring-1 ring-slate-900/10',
        className,
      )}
    >
      <iframe
        title={title}
        src={`https://sketchfab.com/models/${modelUid}/embed?${params.toString()}`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
        className="aspect-video h-auto w-full border-0"
      />
    </div>
  )
}
