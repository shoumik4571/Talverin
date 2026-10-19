import { cn } from '@/lib/utils'
import CountUp from '@/components/react-bits/CountUp'

export type AdminStatGoal = {
  title: string
  minutes: number
  daysLeft: number
  bar: string
}

function MiniBars({
  values,
  highlight,
  barClass = 'bg-[#15C39A]',
  duotoneClass = 'bg-violet-500/70',
}: {
  values: number[]
  highlight?: number
  barClass?: string
  duotoneClass?: string
}) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden="true">
      {values.map((v, i) => {
        const fill = Math.max(12, Math.round((v / max) * 100))
        const headroom = Math.round(((max - v) / max) * 55)
        return (
          <div key={i} className="flex h-full flex-1 flex-col justify-end gap-[2px]">
            {headroom > 8 && (
              <div style={{ height: `${headroom}%` }} className={cn('w-full rounded-sm', duotoneClass)} />
            )}
            <div style={{ height: `${fill}%` }} className={cn('w-full rounded-sm', i === highlight ? barClass : 'bg-white/[0.14]')} />
          </div>
        )
      })}
    </div>
  )
}

function Donut({ pct }: { pct: number }) {
  const r = 15.5
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div className="relative flex h-10 w-10 items-center justify-center" aria-hidden="true">
      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="transparent" stroke="rgba(255,255,255,.1)" strokeWidth="4" className="donut-track" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="transparent"
          stroke="#15C39A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          className="donut-arc"
        />
      </svg>
      <span className="absolute font-mono text-[9px] font-bold tabular-nums text-slate-900">
        {clamped}%
      </span>
    </div>
  )
}

function Card({
  label,
  value,
  sub,
  children,
}: {
  label: string
  value: React.ReactNode
  sub: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-2 rounded-2xl border border-slate-900/[0.08] bg-white p-5">
      <div className="min-w-0">
        <span className="block truncate text-[11px] font-medium text-zinc-500">{label}</span>
        <span className="font-display mt-1.5 block truncate text-[28px] font-semibold leading-none tracking-tight text-slate-900">
          {value}
        </span>
        <span className="mt-1 block truncate text-[11px] tabular-nums text-zinc-500">{sub}</span>
      </div>
      {children}
    </div>
  )
}

/**
 * AdminCNStats — AdminCN-style stat row, personalized for Talverin.
 * Every number comes from the live plan; no placeholder metrics.
 */
export function AdminCNStats({
  weekMinutes,
  selectedDayIdx,
  todayGoalMinutes,
  doneGoalMinutes,
  sessionsDone,
  sessionsTotal,
  goals,
  readiness,
  capacityLabel,
  routineCount,
  weekSessions,
  className,
}: {
  weekMinutes: number[]
  selectedDayIdx: number
  todayGoalMinutes: number
  doneGoalMinutes: number
  sessionsDone: number
  sessionsTotal: number
  goals: AdminStatGoal[]
  readiness: number
  capacityLabel: string
  routineCount: number
  weekSessions: number[]
  className?: string
}) {
  const pct =
    todayGoalMinutes > 0 ? Math.round((doneGoalMinutes / todayGoalMinutes) * 100) : 0
  const soonest = goals.length
    ? goals.reduce((a, b) => (a.daysLeft <= b.daysLeft ? a : b))
    : null
  const maxAlloc = Math.max(1, ...goals.map((g) => g.minutes))

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6', className)}>
      <Card
        label="Today's Focus"
        value={`${(todayGoalMinutes / 60).toFixed(1)}h`}
        sub={`${todayGoalMinutes}m planned`}
      >
        <MiniBars values={weekMinutes} highlight={selectedDayIdx} />
      </Card>

      <Card label="Completed" value={<><CountUp to={pct} />%</>} sub={`${doneGoalMinutes}m of ${todayGoalMinutes}m`}>
        <Donut pct={pct} />
      </Card>

      <Card
        label="Active Goals"
        value={<CountUp to={goals.length} />}
        sub={soonest ? `due in ${soonest.daysLeft}d` : 'no deadlines'}
      >
        <div className="flex h-10 flex-col justify-center gap-1.5" aria-hidden="true">
          {goals.slice(0, 4).map((g) => (
            <div key={g.title} className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                style={{ width: `${Math.round((g.minutes / maxAlloc) * 100)}%` }}
                className={cn('h-full rounded-full bg-gradient-to-r', g.bar)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card label="Readiness" value={<CountUp to={readiness} />} sub={capacityLabel}>
        <div className="flex h-10 flex-col justify-center gap-2" aria-hidden="true">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#15C39A] to-[#18D2A6]"
            />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-zinc-500">
            {readiness >= 90 ? 'exceptional' : readiness >= 80 ? 'strong' : 'warming up'}
          </span>
        </div>
      </Card>

      <Card
        label="Sessions Done"
        value={<><CountUp to={sessionsDone} />/{sessionsTotal}</>}
        sub="deep-work blocks"
      >
        <MiniBars values={weekSessions} highlight={selectedDayIdx} barClass="bg-[#4F7DF9]" duotoneClass="bg-[#4F7DF9]/40" />
      </Card>

      <Card label="Routine Blocks" value={<CountUp to={routineCount} />} sub="protected hours">
        <div className="flex h-10 items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.min(Math.max(1, routineCount), 8) }).map((_, i) => (
            <span key={i} className="h-2 flex-1 rounded-full bg-indigo-400/80" />
          ))}
        </div>
      </Card>
    </div>
  )
}
