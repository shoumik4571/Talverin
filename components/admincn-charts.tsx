import { Check, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

function Panel({
  title,
  sub,
  children,
  className,
}: {
  title: string
  sub: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-slate-900/[0.08] bg-white p-5 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** Mirrors AdminCN "Total Transaction": labeled bars, weekday axis, peak highlighted. */
export function WeeklyFocusChart({
  minutes,
  labels,
  highlight,
  className,
}: {
  minutes: number[]
  labels: string[]
  highlight: number
  className?: string
}) {
  const max = Math.max(1, ...minutes)
  const peak = minutes.indexOf(max)
  return (
    <Panel title="Weekly Focus" sub="Planned deep-work minutes per day" className={className}>
      <div className="flex h-44 items-end gap-2 sm:gap-3" aria-hidden="true">
        {minutes.map((m, i) => {
          const h = Math.max(8, Math.round((m / max) * 100))
          const isPeak = i === peak && m > 0
          return (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <span
                className={cn(
                  'font-mono text-[11px] font-semibold tabular-nums',
                  isPeak ? 'text-slate-900' : 'text-zinc-500',
                )}
              >
                {m >= 60 ? `${(m / 60).toFixed(1)}h` : `${m}m`}
              </span>
              <div
                style={{ height: `${h}%` }}
                className={cn(
                  'w-full max-w-10 rounded-md',
                  isPeak ? 'bg-[#15C39A]' : 'bg-white/[0.1]',
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3" aria-hidden="true">
        {labels.map((l, i) => (
          <span
            key={`${l}-${i}`}
            className={cn(
              'min-w-0 flex-1 truncate text-center text-[11px]',
              i === highlight ? 'font-semibold text-slate-900' : 'text-zinc-500',
            )}
          >
            {l}
          </span>
        ))}
      </div>
    </Panel>
  )
}

/** Mirrors AdminCN "Report": period rows, performance, one action. */
export function CompletionReport({
  doneMinutes,
  remainingMinutes,
  sessionsDone,
  sessionsTotal,
  weekPct,
  onRefit,
}: {
  doneMinutes: number
  remainingMinutes: number
  sessionsDone: number
  sessionsTotal: number
  weekPct: number
  onRefit: () => void
}) {
  return (
    <Panel title="Completion Report" sub="Done vs planned across the week">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[#15C39A]/15 text-[#15C39A]">
            <Check className="size-4 stroke-[2.5]" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-xs text-zinc-500">Finished today</span>
            <strong className="font-display block text-xl font-semibold tabular-nums text-slate-900">
              +{doneMinutes}m
            </strong>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
            <Clock className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-xs text-zinc-500">Still scheduled</span>
            <strong className="font-display block text-xl font-semibold tabular-nums text-slate-900">
              {remainingMinutes}m
            </strong>
          </div>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-zinc-500">
            {sessionsDone}/{sessionsTotal} blocks
          </span>
        </div>
        <div className="border-t border-white/[0.07] pt-4">
          <span className="block text-xs text-zinc-500">Performance</span>
          <div className="mt-1 flex items-center justify-between gap-3">
            <strong className="font-display text-2xl font-semibold tabular-nums text-slate-900">
              +{weekPct}%
            </strong>
            <button
              type="button"
              onClick={onRefit}
              className="btn-shine inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-[#F4F4F5] px-4 text-xs font-bold text-zinc-950 transition-colors hover:bg-zinc-300"
            >
              <Zap className="size-3.5" /> Re-fit Schedule
            </button>
          </div>
        </div>
      </div>
    </Panel>
  )
}

/** Mirrors AdminCN "Total sales": total + split rows + stacked viz. */
export function GoalSplit({
  totalMinutes,
  rows,
  className,
}: {
  totalMinutes: number
  rows: Array<{ title: string; minutes: number; share: number; bar: string }>
  className?: string
}) {
  return (
    <Panel
      title="Goal Split"
      sub={`${(totalMinutes / 60).toFixed(1)}h planned across ${rows.length} goals`}
      className={className}
    >
      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
        {rows.map((r) => (
          <div
            key={r.title}
            style={{ width: `${Math.max(4, r.share)}%` }}
            className={cn('h-full bg-gradient-to-r', r.bar)}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col divide-y divide-white/[0.06]">
        {rows.map((r) => (
          <div key={r.title} className="flex items-center gap-3 py-2.5">
            <span className={cn('size-2 shrink-0 rounded-full bg-gradient-to-r', r.bar)} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-900">
              {r.title}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-400">
              {r.minutes}m
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-[#15C39A]">
              {r.share}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/** Mirrors AdminCN "Earning Report" rows: protected routine ledger. */
export function RoutineGuard({
  blocks,
}: {
  blocks: Array<{ title: string; range: string; minutes: number }>
}) {
  return (
    <Panel title="Routine Guard" sub={`${blocks.length} blocks the AI must not overlap`}>
      <div className="flex flex-col divide-y divide-white/[0.06]">
        {blocks.slice(0, 5).map((b) => (
          <div key={b.title} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-slate-900">{b.title}</span>
              <span className="mt-0.5 block font-mono text-[11px] tabular-nums text-zinc-500">
                {b.range} • {b.minutes}m
              </span>
            </div>
            <span className="shrink-0 rounded-md bg-[#15C39A]/10 px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-[#15C39A]">
              kept
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
