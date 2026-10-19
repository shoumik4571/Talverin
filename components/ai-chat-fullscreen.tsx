'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, MessageCircleHeart, SendHorizonal, X, Paperclip, Image as ImageIcon, Mic, Paperclip as AttachIcon } from 'lucide-react'
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
  images?: string[] // base64 encoded images
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

interface AiChatFullScreenProps {
  messages: ChatMessage[]
  typing: boolean
  onSend: (text: string, images?: string[], files?: { name: string; type: string; size: number; data: string }[]) => void
  onClose: () => void
  goals: Goal[]
  isDark?: boolean
}

export function AiChatFullScreen({
  messages,
  typing,
  onSend,
  onClose,
  goals,
  isDark = false,
}: AiChatFullScreenProps) {
  const [draft, setDraft] = useState('')
  const [showAttachments, setShowAttachments] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewFiles, setPreviewFiles] = useState<{ name: string; type: string; size: number; data: string }[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []
    const newFiles: { name: string; type: string; size: number; data: string }[] = []
    let processedCount = 0

    Array.from(files).forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (file.type.startsWith('image/')) {
          newImages.push(result)
        } else {
          newFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: result,
          })
        }
        processedCount++
        if (processedCount === files.length) {
          setPreviewImages(prev => [...prev, ...newImages])
          setPreviewFiles(prev => [...prev, ...newFiles])
          // Clear input so same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
      reader.onerror = () => {
        processedCount++
        if (processedCount === files.length) {
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const submit = () => {
    const clean = draft.trim()
    if ((!clean && previewImages.length === 0 && previewFiles.length === 0) || typing) return
    
    onSend(clean, previewImages.length > 0 ? previewImages : undefined, previewFiles.length > 0 ? previewFiles : undefined)
    
    setDraft('')
    setPreviewImages([])
    setPreviewFiles([])
    setShowAttachments(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`aichat-fullscreen h-full flex flex-col ${isDark ? 'dark bg-[#09090B]' : ''}`}
      role="dialog"
      aria-label="Talverin AI chat"
    >
      {/* Header */}
      <div className={`aichat-fullscreen-head flex-shrink-0 flex items-center justify-between gap-4 p-4 border-b sticky top-0 z-10 ${isDark ? 'border-slate-700/30 bg-[#09090B]/95' : 'border-slate-900/[0.06] bg-white/95'} backdrop-blur-sm sticky top-0 z-10`}>
        <div className="aichat-brand flex items-center gap-3">
          <div className="aichat-presence flex items-center gap-2">
            <div className="aichat-ping relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#15C39A] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#15C39A]" />
            </div>
            <span className="aichat-dot-live relative inline-flex size-1.5 rounded-full bg-[#15C39A] ring-2 ring-white" />
          </div>
          <div className="aichat-titles">
            <strong className={`aichat-name text-lg font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Talverin AI</strong>
            <span className={`aichat-tag text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Friend · coach · schedule editor · image upload</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachments(!showAttachments)}
            aria-label="Toggle attachments"
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              showAttachments
                ? 'bg-[#0B1917] text-[#15C39A] ring-1 ring-[#15C39A]/30'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Paperclip className="size-4" />
            <span>Attach</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI chat"
            className={`flex items-center justify-center size-9 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'}`}
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div ref={listRef} className={`aichat-fullscreen-list flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-[#09090B]' : 'bg-[#FAFAFA]'}`} role="log" aria-live="polite">
        {messages.map((m) =>
          m.role === 'system' ? (
            <motion.p
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="aichat-fullscreen-sys text-center text-xs text-slate-400 px-4 py-2 bg-slate-50/50 rounded-xl"
            >
              {m.content}
            </motion.p>
          ) : m.role === 'user' ? (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aichat-fullscreen-row-user flex justify-end"
            >
              <div className="max-w-[80%] flex flex-col items-end gap-2">
                {(m.images && m.images.length > 0) && (
                  <div className="flex gap-2">
                    {m.images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden max-w-xs">
                        <img
                          src={img}
                          alt={`Uploaded image ${idx + 1}`}
                          className="rounded-xl w-full h-auto"
                          onClick={() => window.open(img, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {(m.files && m.files.length > 0) && (
                  <div className="flex flex-col gap-1 max-w-xs">
                    {m.files.map((file, idx) => (
                      <div key={idx} className={`flex items-center gap-2 rounded-lg p-2 text-xs ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/50'}`}>
                        <Paperclip className={`size-3.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
                        <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{file.name}</span>
                        <span className={`text-slate-400 font-mono ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className="aichat-fullscreen-bu rounded-2xl bg-[#0B1917] px-4 py-3 text-white text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderRich(m.content) }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aichat-fullscreen-row-ai flex justify-start"
            >
              <div className="max-w-[80%] flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#15C39A] to-[#0E8A6D]">
                    <MessageCircleHeart className="size-4 text-white" />
                  </div>
                  <strong className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Talverin AI</strong>
                </div>
                <div
                  className={`aichat-fullscreen-bai rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${isDark ? 'bg-slate-800 text-slate-100 ring-slate-700/30' : 'bg-white text-slate-900 ring-slate-900/[0.06]'}`}
                  dangerouslySetInnerHTML={{ __html: renderRich(m.content) }}
                />
              </div>
            </motion.div>
          ),
        )}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="aichat-fullscreen-row-ai flex justify-start"
          >
            <div className="max-w-[80%]">
              <div className={`aichat-fullscreen-bai rounded-2xl px-4 py-3 ring-1 ${isDark ? 'bg-slate-800 text-slate-100 ring-slate-700/30' : 'bg-white text-slate-900 ring-slate-900/[0.06]'}`}>
                <span className="aichat-typing flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      className={`aichat-tdot size-1.5 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-400'}`}
                    />
                  ))}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Attachment Preview */}
      <AnimatePresence>
        {(showAttachments || previewImages.length > 0 || previewFiles.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="aichat-fullscreen-attachments flex-shrink-0 p-4 border-t border-slate-900/[0.06] bg-slate-50/30"
          >
            {(previewImages.length > 0) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative size-16 rounded-xl overflow-hidden ring-1 ring-slate-200">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePreviewImage(idx)}
                      className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(previewFiles.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {previewFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-slate-200">
                    <Paperclip className="size-4 text-slate-400" />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="truncate text-xs font-medium text-slate-700">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePreviewFile(idx)}
                      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Chips */}
      {messages.filter((m) => m.role === 'user').length < 3 && (
        <div className="aichat-fullscreen-chips flex-shrink-0 px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => { setDraft(s); submit(); }} className="aichat-fullscreen-chip flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-900/[0.06] hover:bg-slate-50 transition-colors">
              <MessageCircleHeart className="size-3.5 text-[#15C39A]" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="aichat-fullscreen-input-area flex-shrink-0 p-4 border-t border-slate-900/[0.06] bg-white/95 backdrop-blur-sm">
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <input
                ref={(el) => { if (el) el.focus() }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask, vent, or tell me to move things… (Shift+Enter for new line)"
                aria-label="Message Talverin AI"
                className="aichat-fullscreen-input w-full rounded-2xl bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/[0.06] focus:ring-2 focus:ring-[#15C39A]/30 focus:ring-offset-2 focus:ring-offset-white transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach files or images"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <AttachIcon className="size-4.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="submit"
                disabled={(!draft.trim() && previewImages.length === 0 && previewFiles.length === 0) || typing}
                aria-label="Send message"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] text-white font-semibold text-sm shadow-[0_4px_16px_rgba(21,195,154,0.3)] hover:from-[#18D2A6] hover:to-[#11A683] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#14B892] disabled:hover:to-[#0E8A6D] transition-all"
              >
                <SendHorizonal className="size-4.5" />
              </button>
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Shift+Enter</kbd> for new line
          </p>
        </form>
      </div>
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