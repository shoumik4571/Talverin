'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, MessageCircleHeart, SendHorizonal, X } from 'lucide-react'
import {
  hhmmToMins,
  minsToHhmm,
  type ScheduleItem,
} from '@/components/talverin-app'

export type ChatRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  images?: string[]
  files?: { name: string; type: string; size: number; data: string }[]
}

export type Goal = {
  id: string
  title: string
  category: string
  description: string
  estimatedHours: number
  date: string
  priority: 'High' | 'Medium' | 'Normal'
}

export type ChatOp =
  | { op: 'move'; find: string; to: string; day?: number }
  | { op: 'add'; title: string; start: string; end: string; kind?: string; day?: number }
  | { op: 'remove'; find: string; day?: number }
  | { op: 'done'; find: string; day?: number }
  | { op: 'rename'; find: string; title: string; day?: number }
  | { op: 'set_wake'; to: string }
  | { op: 'set_sleep'; to: string }
  | { op: 'set_morning_start'; to: string }
  | { op: 'set_afternoon_start'; to: string }
  | { op: 'set_capacity'; minutes: number }
  | { op: 'add_routine'; title: string; start: string; end: string; category?: string }
  | { op: 'remove_routine'; find: string }
  | { op: 'add_goal'; title: string; category?: string; estimatedHours?: number; date?: string; priority?: string }
  | { op: 'remove_goal'; find: string }
  | { op: 'set_priority'; find: string; priority: string }
  | { op: 'set_deadline'; find: string; date: string }
  | { op: 'set_theme'; theme: 'light' | 'dark' }
  | { op: 'set_perf'; on: boolean }
  | { op: 'set_name'; name: string }
  | { op: 'set_occupation'; occupation: string }
  | { op: 'set_capacity'; minutes: number }
  | { op: 'set_goal_category'; find: string; category: string }
  | { op: 'set_goal_estimated_hours'; find: string; hours: number }
  | { op: 'set_goal_date'; find: string; date: string }

const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/

function findItem(items: ScheduleItem[], find: string): ScheduleItem | undefined {
  const q = (find || '').trim().toLowerCase()
  if (!q) return undefined
  return (
    items.find((i) => i.id === find) ||
    items.find((i) => i.title.toLowerCase().includes(q)) ||
    items.find((i) => i.start === find)
  )
}

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/

function validPriority(p: unknown): 'High' | 'Medium' | 'Normal' | undefined {
  return p === 'High' || p === 'Medium' || p === 'Normal' ? p : undefined
}

function validDate(d: unknown): string | undefined {
  return typeof d === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
    !Number.isNaN(new Date(`${d}T00:00`).getTime())
    ? d
    : undefined
}

function addDaysYmd(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Applies AI-proposed schedule ops to one day's items. Pure + validated:
 * returns the new list plus human-readable applied/skipped notes.
 */
export function applyChatOps(
  items: ScheduleItem[],
  ops: ChatOp[],
  goals: Goal[],
): { items: ScheduleItem[]; applied: string[]; skipped: string[]; totalGoalMinutes: number } {
  let next = items.map((i) => ({ ...i }))
  const applied: string[] = []
  const skipped: string[] = []
  const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/

  const matchGoal = (find: string) => {
    const q = find.trim().toLowerCase()
    if (!q) return undefined
    return (
      goals.find((g) => g.title.toLowerCase() === q) ||
      goals.find((g) => g.title.toLowerCase().includes(q))
    )
  }

  const removedGoalIds = new Set<string>()

  for (const op of (ops || []).slice(0, 8)) {
    if (!op || typeof op !== 'object') continue
    if (!op.op || typeof op.op !== 'string') continue

    // Handle ops that don't need a target item
    if (op.op === 'add') {
      const title = String(op.title || '').trim()
      if (!title || !TIME_RE.test(op.start || '') || !TIME_RE.test(op.end || '')) {
        skipped.push('an add (missing title or valid times)')
        continue
      }
      const dur = hhmmToMins(op.end) - hhmmToMins(op.start)
      if (dur < 5) {
        skipped.push(`"${title}" (end must be after start)`)
        continue
      }
      next.push({
        id: `chat-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        start: op.start,
        end: op.end,
        durationMinutes: dur,
        title,
        type: op.kind === 'routine' ? 'routine' : 'deep-work',
        status: 'PLANNED',
      })
      applied.push(`added "${title}" ${op.start}–${op.end}`)
      continue
    }

    if (op.op === 'set_wake' || op.op === 'set_sleep' || op.op === 'set_morning_start' || op.op === 'set_afternoon_start') {
      const to = String(op.to || '')
      if (!TIME_RE.test(to)) {
        skipped.push('a time change (needs HH:MM)')
        continue
      }
      const label = op.op === 'set_wake' ? 'wake-up' : op.op === 'set_sleep' ? 'bedtime' : op.op === 'set_morning_start' ? 'morning work starts' : 'afternoon work resumes'
      applied.push(`${label} set to ${to}`)
      continue
    }

    if (op.op === 'set_capacity') {
      const m = Math.round(Number(op.minutes))
      if (!Number.isFinite(m) || m < 60 || m > 720) {
        skipped.push('capacity change (use 60–720 minutes)')
        continue
      }
      applied.push(`daily capacity set to ${(m / 60).toFixed(1)}h`)
      continue
    }

    if (op.op === 'add_routine') {
      const title = (op.title || '').trim()
      if (!title || !TIME_RE.test(op.start || '') || !TIME_RE.test(op.end || '') || hhmmToMins(op.end) <= hhmmToMins(op.start)) {
        skipped.push('a routine add (need a title and valid times)')
        continue
      }
      const cat = ['sport', 'sleep', 'meal'].includes(op.category || '')
        ? op.category
        : 'routine'
      applied.push(`added routine "${title}" ${op.start}–${op.end}`)
      continue
    }

    if (op.op === 'remove_routine') {
      const raw = String(op.find || '')
      const q = raw.trim().toLowerCase()
      const hit = goals.find((g) => g.title.toLowerCase().includes(q)) ||
        goals.find((g) => g.title.toLowerCase() === q)
      if (!q || !hit) {
        skipped.push(`routine "${raw || '?'}” (not found)`)
        continue
      }
      applied.push(`removed routine "${hit.title}"`)
      continue
    }

    if (op.op === 'add_goal') {
      const title = (op.title || '').trim()
      if (!title) {
        skipped.push('a goal add (needs a title)')
        continue
      }
      const g: Goal = {
        id: `goal-chat-${Date.now()}`,
        title,
        category: (op.category || 'Custom Personal Goal').toString(),
        description: 'Added via AI chat.',
        estimatedHours: Number.isFinite(Number(op.estimatedHours)) ? Number(op.estimatedHours) : 12,
        date: validDate(op.date) ?? addDaysYmd(10),
        priority: validPriority(op.priority) ?? 'Medium',
      }
      applied.push(`added goal "${title}"`)
      continue
    }

    if (op.op === 'remove_goal') {
      const t = matchGoal(String(op.find || ''))
      if (!t || removedGoalIds.has(t.id)) {
        skipped.push(`goal "${String(op.find || '?')}” (not found)`)
        continue
      }
      removedGoalIds.add(t.id)
      applied.push(`removed goal "${t.title}"`)
      continue
    }

    if (op.op === 'set_priority') {
      const t = matchGoal(String(op.find || ''))
      const p = validPriority(op.priority)
      if (!t || removedGoalIds.has(t.id) || !p) {
        skipped.push('a priority change (need a known goal + High/Medium/Normal)')
        continue
      }
      applied.push(`"${t.title}" set to ${p} priority`)
      continue
    }

    if (op.op === 'set_deadline') {
      const t = matchGoal(String(op.find || ''))
      const d = validDate(op.date)
      if (!t || removedGoalIds.has(t.id) || !d) {
        skipped.push('a deadline change (need a known goal + YYYY-MM-DD date)')
        continue
      }
      applied.push(`"${t.title}" due ${d}`)
      continue
    }

    if (op.op === 'set_theme') {
      const theme = String(op.theme || '').toLowerCase()
      if (theme !== 'light' && theme !== 'dark') {
        skipped.push('theme change (use light or dark)')
        continue
      }
      applied.push(`theme set to ${theme}`)
      continue
    }

    if (op.op === 'set_perf') {
      applied.push(`performance mode ${op.on ? 'on' : 'off'}`)
      continue
    }

    if (op.op === 'set_name') {
      const name = String(op.name || '').trim()
      if (!name) {
        skipped.push('a name change (empty name)')
        continue
      }
      applied.push(`name set to "${name}"`)
      continue
    }

    if (op.op === 'set_occupation') {
      const occ = String(op.occupation || '').trim()
      if (!occ) {
        skipped.push('an occupation change (empty)')
        continue
      }
      applied.push(`occupation set to "${occ}"`)
      continue
    }

    // For move, rename, remove, done - need a target item
    const target = findItem(next, String((op as { find?: string }).find || ''))
    if (!target) {
      skipped.push(`"${String((op as { find?: string }).find || '?')}" (not found)`)
      continue
    }

    if (op.op === 'move') {
      if (!TIME_RE.test(op.to || '')) {
        skipped.push(`move "${target.title}" (bad time)`)
        continue
      }
      const dur = target.durationMinutes || 60
      target.start = op.to
      target.end = minsToHhmm(hhmmToMins(op.to) + dur)
      target.durationMinutes = dur
      applied.push(`moved "${target.title}" to ${op.to}`)
    } else if (op.op === 'rename') {
      const title = String(op.title || '').trim()
      if (!title) {
        skipped.push('a rename (empty title)')
      } else {
        target.title = title
        applied.push(`renamed to "${title}"`)
      }
    } else if (op.op === 'remove') {
      next = next.filter((i) => i.id !== target.id)
      applied.push(`removed "${target.title}"`)
    } else if (op.op === 'done') {
      target.status = 'DONE'
      applied.push(`marked "${target.title}" done`)
    } else {
      skipped.push('an unknown operation')
    }
  }

  // Light forward-shift so moved/added blocks never silently overlap.
  next.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
  for (let i = 0; i < next.length - 1; i++) {
    const currEnd = hhmmToMins(next[i].end)
    const nextStart = hhmmToMins(next[i + 1].start)
    if (currEnd > nextStart && next[i + 1].type === 'deep-work') {
      const dur = next[i + 1].durationMinutes || 60
      next[i + 1].start = minsToHhmm(currEnd)
      next[i + 1].end = minsToHhmm(currEnd + dur)
      next[i + 1].durationMinutes = dur
    }
  }
  next.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))

  const totalGoalMinutes = next
    .filter((i) => i.type === 'deep-work')
    .reduce((a, i) => a + (i.durationMinutes || 0), 0)
  return { items: next, applied, skipped, totalGoalMinutes }
}

function renderRich(text: string): string {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') && p.length > 4
      ? `<strong class="font-bold">${p.slice(2, -2)}</strong>`
      : p
  ).join('')
}

const SUGGESTIONS = [
  'How can I improve today?',
  'Lighten my evening',
  'Move my last session earlier',
]

export function AiChatPanel({
  messages,
  typing,
  onSend,
  onClose,
}: {
  messages: ChatMessage[]
  typing: boolean
  onSend: (text: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const userCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const submit = (text: string) => {
    const clean = text.trim()
    if (!clean || typing) return
    setDraft('')
    onSend(clean)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="aichat-panel"
      role="dialog"
      aria-label="Talverin AI chat"
    >
      <div className="aichat-head">
        <div className="aichat-brand">
          <span className="aichat-presence">
            <span className="aichat-ping" />
            <span className="aichat-dot-live" />
          </span>
          <div className="aichat-titles">
            <strong className="aichat-name">Talverin AI</strong>
            <span className="aichat-tag">Friend · coach · schedule editor</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI chat"
          className="aichat-x"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={listRef} className="aichat-list">
        {messages.map((m) =>
          m.role === 'system' ? (
            <p key={m.id} className="aichat-sys">
              {m.content}
            </p>
          ) : m.role === 'user' ? (
            <div key={m.id} className="aichat-row-user">
              <p className="aichat-bu">{renderRich(m.content)}</p>
            </div>
          ) : (
            <div key={m.id} className="aichat-row-ai">
              <p className="aichat-bai">{renderRich(m.content)}</p>
            </div>
          ),
        )}
        {typing && (
          <div className="aichat-row-ai">
            <span className="aichat-typing">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  className="aichat-tdot"
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {messages.filter((m) => m.role === 'user').length < 3 && (
        <div className="aichat-chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => submit(s)} className="aichat-chip">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(draft)
        }}
        className="aichat-form"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask, vent, or tell me to move things…"
          aria-label="Message Talverin AI"
          className="aichat-input"
        />
        <button
          type="submit"
          disabled={!draft.trim() || typing}
          aria-label="Send message"
          className="aichat-send"
        >
          <SendHorizonal className="size-4" />
        </button>
      </form>
    </motion.div>
  )
}

export function AiChatFab({ onOpen, hasUnread }: { onOpen: () => void; hasUnread?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label="Open AI chat"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="aichat-fab"
    >
      <MessageCircleHeart className="size-6" />
      {hasUnread && <span className="aichat-unread" />}
    </motion.button>
  )
}