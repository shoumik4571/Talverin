'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, Play } from 'lucide-react'
import {
  formatTaskTitle,
  hhmmToMins,
  type ScheduleItem,
} from '@/components/talverin-app'

export type EdgeSnapshot = {
  next: ScheduleItem
  minsToGo: number
  isLive: boolean
}

export function snapshotEdgeCompanion(items: ScheduleItem[], nowM: number): EdgeSnapshot | null {
  const deep = items
    .filter((i) => i.type === 'deep-work')
    .sort((a, b) => (a.start < b.start ? -1 : 1))
  if (!deep.length) return null
  const current =
    deep.find((i) => i.status === 'IN_PROGRESS') ||
    deep.find(
      (i) =>
        i.status === 'PLANNED' && hhmmToMins(i.start) <= nowM && nowM < hhmmToMins(i.end),
    ) ||
    null
  const next =
    deep.find((i) => i.status === 'PLANNED' && hhmmToMins(i.start) > nowM) || null
  const upcoming = next || current
  if (!upcoming) return null
  return {
    next: upcoming,
    minsToGo: Math.max(0, hhmmToMins(upcoming.start) - nowM),
    isLive: current?.id === upcoming.id && current?.status === 'IN_PROGRESS',
  }
}

/**
 * EdgeCompanion — Grammarly-style right-edge tab with a now/next panel.
 * Pure presentational state inside; parent supplies items + actions.
 */
export function EdgeCompanion({
  items,
  nowM,
  onStart,
  onDone,
  onOpenReports,
}: {
  items: ScheduleItem[]
  nowM: number
  onStart: (id: string) => void
  onDone: (id: string) => void
  onOpenReports: () => void
}) {
  const [open, setOpen] = useState(false)
  const snap = useMemo(() => snapshotEdgeCompanion(items, nowM), [items, nowM])
  if (!snap) return null

  return (
    <div
      className="edge-companion"
      style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 40 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="inner-highlight mr-3 w-64 rounded-2xl bg-white p-4 ring-1 ring-slate-900/[0.08]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {snap.isLive ? 'Live now' : 'Up next'}
              </span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-[#0E8A6D]">
                {snap.next.start}
              </span>
            </div>
            <strong className="mt-1.5 line-clamp-2 block text-xs font-bold leading-snug text-slate-900">
              {formatTaskTitle(snap.next.title).headline}
            </strong>
            <span className="mt-1 block text-[11px] text-slate-500">
              {snap.isLive
                ? 'Session in progress'
                : snap.minsToGo <= 0
                  ? 'Starting now'
                  : `Starts in ${snap.minsToGo}m`}
            </span>
            <div className="mt-3 flex gap-1.5">
              {snap.next.status === 'PLANNED' && (
                <button
                  type="button"
                  onClick={() => {
                    onStart(snap.next.id)
                    setOpen(false)
                  }}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-2 py-1.5 text-[11px] font-bold text-white"
                >
                  <Play className="size-3 fill-current" /> Start
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onDone(snap.next.id)
                  setOpen(false)
                }}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Check className="size-3 stroke-[2.5]" /> Done
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenReports()
                setOpen(false)
              }}
              className="mt-2 w-full cursor-pointer text-center text-[11px] font-semibold text-[#0E8A6D] hover:underline"
            >
              Open Day Reports
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close schedule companion' : 'Open schedule companion'}
        aria-expanded={open}
        style={{ borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
        className={`flex cursor-pointer flex-col items-center gap-1.5 px-2 py-3 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.25)] ring-1 transition-colors ${
          open
            ? 'bg-[#0B1917] text-[#15C39A] ring-slate-900'
            : 'bg-white text-slate-600 ring-slate-900/[0.08] hover:text-[#0E8A6D]'
        }`}
      >
        <span className="relative flex size-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
              snap.isLive ? 'bg-[#15C39A]' : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex size-2 rounded-full ${
              snap.isLive ? 'bg-[#15C39A]' : 'bg-amber-400'
            }`}
          />
        </span>
        <span
          className="font-mono text-[10px] font-bold tabular-nums"
          style={{ writingMode: 'vertical-rl' }}
        >
          {snap.next.start}
        </span>
        <ChevronLeft
          className="size-3.5 transition-transform"
          style={open ? { transform: 'rotate(180deg)' } : undefined}
        />
      </button>
    </div>
  )
}
