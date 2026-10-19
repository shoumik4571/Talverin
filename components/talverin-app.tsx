'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

declare global {
  interface Window {
    electronAPI?: {
      showAlarm: (alarmData: { id: string; startTime: string; title: string; duration: number; type: 'start' | 'end' | 'missed' | 'live' }) => void;
      onAlarmAction: (callback: (event: Electron.IpcRendererEvent, data: { action: string; id: string }) => void) => void;
    };
  }
}
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import GeometryBackdrop from '@/components/geometry-backdrop'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Meteors } from '@/components/magicui/meteors'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'
import { ShineBorder } from '@/components/magicui/shine-border'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { GridPattern } from '@/components/magicui/grid-pattern'
import { BorderTrail } from '@/components/motion-primitives/border-trail'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { Tilt } from '@/components/motion-primitives/tilt'
import { InView } from '@/components/motion-primitives/in-view'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { Spotlight } from '@/components/motion-primitives/spotlight'
import { GlowEffect } from '@/components/motion-primitives/glow-effect'
import { MediaArt } from '@/components/media-art'
import { EdgeCompanion } from '@/components/edge-companion'
import { AiChatFab, AiChatPanel, applyChatOps, type ChatMessage, type ChatOp } from '@/components/ai-chat'
import { AiChatFullScreen } from '@/components/ai-chat-fullscreen'
import { BrandMark } from '@/components/brand-mark'
import { AdminCNStats } from '@/components/admincn-stats'
import BlurText from '@/components/react-bits/BlurText'
import { MagneticButton } from '@/components/anim/MagneticButton'
import { TopoFlow } from '@/components/anim/TopoFlow'
import { ParticleText } from '@/components/anim/ParticleText'
import { StaffBadge } from '@/components/anim/StaffBadge'
import { GlowCard } from '@/components/anim/GlowCard'
import { RingProgress } from '@/components/anim/RingProgress'
import { ElasticToggle } from '@/components/anim/ElasticToggle'
import { GooeyNav } from '@/components/anim/GooeyNav'
import { InViewCounter, InViewCounterDemo } from '@/components/anim/InViewCounter'
import { AuroraGlowInput } from '@/components/anim/AuroraGlowInput'
import { BentoGrid } from '@/components/anim/BentoGrid'
import {
  CompletionReport,
  GoalSplit,
  RoutineGuard,
  WeeklyFocusChart,
} from '@/components/admincn-charts'
import { Link001, Link002, Link004, Link005 } from '@/components/ui/skiper-ui/skiper40'
import {
  Options as SkiperOptionsController,
  ThemeToggleButton1,
  ThemeToggleButton2,
  ThemeToggleButton3,
  ThemeToggleButton4,
  ThemeToggleButton5,
} from '@/components/ui/skiper-ui/skiper4'
import { Skiper26ThemeToggle } from '@/components/ui/skiper-ui/skiper26'
import { SkiperBracketBadge, SkiperPerspectiveHeading } from '@/components/ui/skiper-ui/skiper31'
import {
  SkiperAnimatedNumber,
  SkiperMorphPlayPauseButton,
} from '@/components/ui/skiper-ui/skiper37'
import {
  FramerTiltCard,
  springStaggerContainer,
} from '@/components/ui/skiper-ui/framer-showcase'
import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  CornerDownLeft,
  Edit3,
  FileText,
  Gauge,
  GraduationCap,
  Layers,
  LayoutDashboard,
  MessageCircleHeart,
  Microscope,
  Palette,
  Play,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Volume2,
  X,
  Zap,
} from 'lucide-react'

type Goal = {
  id: string
  title: string
  category: string
  description: string
  estimatedHours: number
  date: string
  priority: 'High' | 'Medium' | 'Normal'
}

export type CustomRoutineBlock = {
  id: string
  start: string
  end: string
  title: string
  category?: 'sport' | 'sleep' | 'meal' | 'class' | 'routine'
}

export type ScheduleItem = {
  id: string
  start: string
  end: string
  durationMinutes: number
  title: string
  type: 'routine' | 'deep-work'
  goal?: string
  deadline?: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'MISSED'
}

type DaySchedule = {
  date: string
  totalGoalMinutes: number
  items: ScheduleItem[]
}

type GoalAnalysis = {
  title: string
  deadline: string
  priority?: string
  summary: string
  daysRemaining: number
  requiredDailyMinutes: number
  sources: Array<{ title: string; url: string; snippet: string }>
  modules: string[]
}

type Plan = {
  personalizationOverview?: string
  goalAnalyses: GoalAnalysis[]
  fullDaySchedule: DaySchedule[]
  roadmap: Array<{ date: string; focus: string; minutes: number }>
}

type DayReport = {
  id: string
  date: string
  generatedAt: number
  plannedMinutes: number
  doneMinutes: number
  completionPct: number
  sessionsDone: number
  sessionsTotal: number
  perGoal: Array<{ title: string; minutes: number; share: number }>
  missed: Array<{ title: string; start: string }>
  focusSessions: Array<{ title: string; start: string; end: string; minutes: number }>
}

type Briefing = {
  date: string
  pct: number
  remainingCount: number
  remainingMinutes: number
  nextTitle: string
  nextStart: string
}

function buildDayReport(day: DaySchedule, goals: Goal[]): DayReport {
  const deep = day.items.filter((i) => i.type === 'deep-work')
  const done = deep.filter((i) => i.status === 'DONE')
  const planned = day.totalGoalMinutes || deep.reduce((a, i) => a + (i.durationMinutes || 0), 0)
  const doneMins = done.reduce((a, i) => a + (i.durationMinutes || 0), 0)
  const perGoal = goals.map((g) => {
    const mins = done
      .filter((i) => i.goal === g.title)
      .reduce((a, i) => a + (i.durationMinutes || 0), 0)
    return {
      title: g.title,
      minutes: mins,
      share: doneMins > 0 ? Math.round((mins / doneMins) * 100) : 0,
    }
  })
  return {
    id: `report-${day.date}`,
    date: day.date,
    generatedAt: Date.now(),
    plannedMinutes: planned,
    doneMinutes: doneMins,
    completionPct: planned > 0 ? Math.round((doneMins / planned) * 100) : 0,
    sessionsDone: done.length,
    sessionsTotal: deep.length,
    perGoal,
    missed: day.items
      .filter((i) => i.status === 'MISSED')
      .map((i) => ({ title: i.title, start: i.start })),
    focusSessions: done.map((i) => ({
      title: i.title,
      start: i.start,
      end: i.end,
      minutes: i.durationMinutes,
    })),
  }
}

const DEFAULT_CUSTOM_ROUTINE_BLOCKS: CustomRoutineBlock[] = [
  {
    id: 'routine-badminton',
    start: '07:00',
    end: '10:00',
    title: 'Play Badminton & Morning Sports',
    category: 'sport',
  },
  {
    id: 'routine-breakfast-prep',
    start: '10:00',
    end: '11:00',
    title: 'Shower, Breakfast & Morning Prep',
    category: 'routine',
  },
  {
    id: 'routine-afternoon-sleep',
    start: '13:00',
    end: '14:30',
    title: 'Afternoon Sleep & Recovery Nap',
    category: 'sleep',
  },
  {
    id: 'routine-lunch-reset',
    start: '14:30',
    end: '16:00',
    title: 'Lunch, Recharge & Pre-Work Reset',
    category: 'meal',
  },
  {
    id: 'routine-dinner',
    start: '20:30',
    end: '21:30',
    title: 'Dinner & Evening Unplug',
    category: 'meal',
  },
  {
    id: 'routine-night-prep',
    start: '21:30',
    end: '23:00',
    title: 'Next-Day Review & Sleep Prep',
    category: 'routine',
  },
]

const GOAL_PALETTES = [
  {
    badge: 'bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20',
    dot: 'bg-[#11A683] ring-4 ring-emerald-500/15',
    bar: 'from-[#11A683] to-[#15C39A]',
    hoverBorder: 'hover:border-emerald-300/80',
  },
  {
    badge: 'bg-indigo-500/10 text-indigo-800 ring-1 ring-indigo-500/20',
    dot: 'bg-indigo-600 ring-4 ring-indigo-500/15',
    bar: 'from-indigo-600 to-violet-500',
    hoverBorder: 'hover:border-indigo-300/80',
  },
  {
    badge: 'bg-violet-500/10 text-violet-800 ring-1 ring-violet-500/20',
    dot: 'bg-violet-600 ring-4 ring-violet-500/15',
    bar: 'from-violet-600 to-fuchsia-500',
    hoverBorder: 'hover:border-violet-300/80',
  },
  {
    badge: 'bg-sky-500/10 text-sky-800 ring-1 ring-sky-500/20',
    dot: 'bg-sky-600 ring-4 ring-sky-500/15',
    bar: 'from-sky-600 to-cyan-500',
    hoverBorder: 'hover:border-sky-300/80',
  },
]

function getGoalPalette(goalTitle: string | undefined, goals: Goal[]) {
  if (!goalTitle) return GOAL_PALETTES[0]
  const idx = goals.findIndex((g) => g.title.toLowerCase() === goalTitle.toLowerCase())
  if (idx >= 0) return GOAL_PALETTES[idx % GOAL_PALETTES.length]
  let hash = 0
  for (let i = 0; i < goalTitle.length; i++) hash = (hash + goalTitle.charCodeAt(i)) % 4
  return GOAL_PALETTES[hash]
}

const OCCUPATION_CARDS = [
  {
    id: 'student',
    title: 'University / College Student',
    tag: 'Academic & Placements',
    subtitle: 'Lectures, semester exams, AI/coding certifications & internship prep',
    defaultFixedLabel: 'College Lectures & Campus Labs',
    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: GraduationCap,
  },
  {
    id: 'software',
    title: 'Software & AI Engineer',
    tag: 'Engineering & Cloud',
    subtitle: 'Sprint deliverables, system architecture, AI upskilling & evening fitness',
    defaultFixedLabel: 'Core Engineering Standups & Office Hours',
    iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    icon: Briefcase,
  },
  {
    id: 'business',
    title: 'Business, Finance & Strategy',
    tag: 'Executive & Ops',
    subtitle: 'Executive reports, financial modeling, analytics & leadership',
    defaultFixedLabel: 'Client Meetings & Core Office Hours',
    iconBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
    icon: BarChart3,
  },
  {
    id: 'founder',
    title: 'Startup Founder / Builder',
    tag: 'Product & Growth',
    subtitle: 'High-leverage maker blocks for MVP shipping, GTM & fundraising',
    defaultFixedLabel: 'Customer Calls & Team Syncs',
    iconBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
    icon: Rocket,
  },
  {
    id: 'research',
    title: 'Exam & Research Aspirant',
    tag: 'Deep Study & Papers',
    subtitle: 'Intensive syllabus mastery, timed mock tests & research publications',
    defaultFixedLabel: 'Coaching / Research Seminar',
    iconBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
    icon: Microscope,
  },
  {
    id: 'creator',
    title: 'Designer & Creative Studio',
    tag: 'Studio & Client Work',
    subtitle: 'Client delivery sprints, UI/UX design systems & content production',
    defaultFixedLabel: 'Client Reviews & Studio Admin',
    iconBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
    icon: Palette,
  },
]

const CAPACITY_CARDS = [
  {
    minutes: 120,
    hoursText: '2.0 hrs',
    label: '1–2 hours / day',
    badge: 'Steady Pace',
    blocks: '2 × 60m blocks',
    score: 76,
    desc: '120 mins of daily goal focus alongside a busy schedule',
  },
  {
    minutes: 240,
    hoursText: '4.0 hrs',
    label: '3–4 hours / day',
    badge: 'Balanced Flow',
    blocks: '3 × 90m blocks',
    score: 88,
    desc: '240 mins of structured morning & afternoon deep work',
  },
  {
    minutes: 360,
    hoursText: '6.0 hrs',
    label: '5–6 hours / day',
    badge: 'Optimal Output',
    blocks: '4 × 90m blocks',
    score: 96,
    desc: 'Full 360 mins (6.0 hrs) of daily goal work + full-day routine',
  },
  {
    minutes: 450,
    hoursText: '7.5 hrs',
    label: '7–8 hours / day',
    badge: 'Deep Immersion',
    blocks: '5 × 90m blocks',
    score: 99,
    desc: '450 mins (7.5 hrs) of daily deep-work blocks for rapid mastery',
  },
]

const ROLE_DEFAULT_GOALS: Record<string, Array<Omit<Goal, 'id' | 'date' | 'priority'>>> = {
  'University / College Student': [
    {
      title: 'Learn Python from Shradha Khapra on Youtube',
      category: 'AI & Coding Mastery',
      description: 'Core Python syntax, data structures, OOP, and hands-on programming exercises',
      estimatedHours: 14,
    },
    {
      title: 'Finish Google AI Essentials on Coursera',
      category: 'AI & Cloud Certifications',
      description: 'Complete all 5 modules, prompt engineering labs, and graded capstone assessment',
      estimatedHours: 12,
    },
    {
      title: 'Solve 50 LeetCode Medium Problems for Placement Prep',
      category: 'Internship & Coding Prep',
      description: 'Arrays, sliding window, trees, graphs, and dynamic programming patterns',
      estimatedHours: 18,
    },
    {
      title: 'Complete Semester Midterm Exam & Lab Revision',
      category: 'Academic Excellence',
      description: 'Review lecture notes, solve past exam papers, and submit lab deliverables',
      estimatedHours: 15,
    },
    {
      title: 'Build & Deploy Full-Stack Portfolio Web Application',
      category: 'Portfolio Projects',
      description: 'Design responsive UI, build API backend, write tests, and deploy on Vercel',
      estimatedHours: 16,
    },
    {
      title: 'Complete Andrew Ng Machine Learning Specialization',
      category: 'AI & Cloud Certifications',
      description: 'Supervised learning, neural networks, and practical ML workflows',
      estimatedHours: 18,
    },
  ],
}

export function formatTaskTitle(raw: string): { headline: string; subtitle: string | null } {
  const clean = (raw || '').trim()
  if (!clean) return { headline: 'Focused Deep-Work Session', subtitle: null }

  const parenMatch = clean.match(/^(.*?)\s*\(([^)]+)\)\.?\s*$/)
  if (parenMatch) {
    const main = parenMatch[1].trim().replace(/\.$/, '')
    const sub = parenMatch[2].trim()
    return {
      headline: main,
      subtitle: sub.charAt(0).toUpperCase() + sub.slice(1),
    }
  }

  if (clean.length > 72 && clean.includes(':')) {
    const idx = clean.indexOf(':')
    const head = clean.slice(0, idx).trim()
    const rest = clean.slice(idx + 1).trim().replace(/\.$/, '')
    if (head.length >= 10 && rest.length > 0) {
      return {
        headline: head,
        subtitle: rest.charAt(0).toUpperCase() + rest.slice(1),
      }
    }
  }

  return { headline: clean.replace(/\.$/, ''), subtitle: null }
}

export function hhmmToMins(hhmm: string): number {
  const clean = (hhmm || '00:00').trim()
  const parts = clean.split(':')
  const h = Math.max(0, Math.min(23, Number(parts[0]) || 0))
  const m = Math.max(0, Math.min(59, Number(parts[1]) || 0))
  return h * 60 + m
}

export function minsToHhmm(totalMins: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMins)))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function nowHhmm(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Fraction of the waking day already elapsed (0..1). */
function dayProgressPct(wake: string, sleep: string, nowDate = new Date()): number {
  const wakeM = hhmmToMins(wake)
  let sleepM = hhmmToMins(sleep)
  if (sleepM <= wakeM) sleepM += 24 * 60
  const nowM = nowDate.getHours() * 60 + nowDate.getMinutes()
  const span = Math.max(60, sleepM - wakeM)
  return Math.min(1, Math.max(0, (nowM - wakeM) / span))
}

function computeOpenDeepWorkSlotsClient(params: {
  wakeTime: string
  sleepTime: string
  morningWorkStart: string
  afternoonWorkStart: string
  routineBlocks: CustomRoutineBlock[]
  dailyWorkMinutes: number
}): Array<{ start: string; end: string; duration: number }> {
  const {
    wakeTime = '07:00',
    sleepTime = '23:00',
    morningWorkStart = '11:00',
    afternoonWorkStart = '16:00',
    routineBlocks,
    dailyWorkMinutes = 360,
  } = params

  const wakeMins = hhmmToMins(wakeTime)
  const sleepMins = Math.max(wakeMins + 180, hhmmToMins(sleepTime))
  const morningStartMins = Math.max(wakeMins, hhmmToMins(morningWorkStart || wakeTime))
  const afternoonResumeMins = hhmmToMins(afternoonWorkStart || '16:00')

  const blocked = new Uint8Array(1440)
  for (let m = 0; m < morningStartMins; m++) blocked[m] = 1
  for (let m = sleepMins; m < 1440; m++) blocked[m] = 1

  for (const rb of routineBlocks) {
    const s = hhmmToMins(rb.start)
    const e = hhmmToMins(rb.end)
    for (let m = Math.max(0, s); m < Math.min(1440, e); m++) {
      blocked[m] = 1
    }
  }

  const middayBlocks = routineBlocks
    .map((rb) => hhmmToMins(rb.start))
    .filter((s) => s >= 12 * 60 && s <= 15 * 60)
  if (middayBlocks.length > 0 && afternoonResumeMins > 13 * 60) {
    const earliestMidday = Math.min(...middayBlocks)
    for (let m = earliestMidday; m < Math.min(1440, afternoonResumeMins); m++) {
      blocked[m] = 1
    }
  }

  const slots: Array<{ start: string; end: string; duration: number }> = []
  let neededMins = Math.max(90, dailyWorkMinutes)
  let cursor = morningStartMins

  while (cursor < sleepMins && neededMins > 0) {
    if (blocked[cursor]) {
      cursor++
      continue
    }
    let windowEnd = cursor
    while (windowEnd < sleepMins && !blocked[windowEnd]) {
      windowEnd++
    }
    const windowLen = windowEnd - cursor
    if (windowLen >= 60) {
      let pos = cursor
      while (pos + 60 <= windowEnd && neededMins > 0) {
        const remainingInWindow = windowEnd - pos
        let blockDur = 90
        if (remainingInWindow >= 90 && neededMins >= 90) {
          blockDur = 90
        } else if (remainingInWindow >= 60) {
          blockDur = Math.floor(Math.min(remainingInWindow, Math.max(60, neededMins)) / 15) * 15
        }
        slots.push({
          start: minsToHhmm(pos),
          end: minsToHhmm(pos + blockDur),
          duration: blockDur,
        })
        neededMins -= blockDur
        pos += blockDur
      }
    }
    cursor = windowEnd
  }

  return slots
}

function addDaysYmd(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysUntilYmd(ymd: string): number {
  const parts = (ymd || '').slice(0, 10).split('-')
  if (parts.length !== 3) return 10
  const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(1, Math.ceil((target.getTime() - today.getTime()) / 86400000))
}

function formatReadableDate(ymd: string): string {
  const parts = (ymd || '').slice(0, 10).split('-')
  if (parts.length !== 3) return ymd
  const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  if (Number.isNaN(dt.getTime())) return ymd
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function startLaptopAlarmLoop(): () => void {
  let stopped = false
  let ctx: AudioContext | null = null
  let intervalId: number | null = null

  const playChime = () => {
    if (stopped) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!ctx) ctx = new AudioCtx()
      if (ctx.state === 'suspended') void ctx.resume()
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, i) => {
        if (!ctx) return
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13)
        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.13)
        gain.gain.exponentialRampToValueAtTime(0.26, ctx.currentTime + i * 0.13 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + i * 0.13)
        osc.stop(ctx.currentTime + i * 0.13 + 0.32)
      })
    } catch {
      // Ignore audio block
    }
  }

  playChime()
  intervalId = window.setInterval(playChime, 1700)

  return () => {
    stopped = true
    if (intervalId !== null) window.clearInterval(intervalId)
    if (ctx) void ctx.close().catch(() => {})
  }
}

/** Single end-of-task chime (no loop). */
function playSingleChime(): void {  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') void ctx.resume()
    const notes = [783.99, 659.25, 523.25]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.16)
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.16)
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + i * 0.16 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.16)
      osc.stop(ctx.currentTime + i * 0.16 + 0.42)
    })
    window.setTimeout(() => void ctx.close().catch(() => {}), 1200)
  } catch {
    // Ignore audio block
  }
}

function todayIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Best-effort OS notification (native banner in Electron when backgrounded). */
function notifyAlarm(title: string, body: string, alarmData?: { id: string; startTime: string; title: string; duration: number; type: 'start' | 'end' | 'missed' | 'live' }): void {
  // Try Electron IPC first (works even when app is not focused)
  try {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.showAlarm) {
      (window as any).electronAPI.showAlarm(alarmData || { title, body, startTime: '', duration: 0, type: 'start', id: '' });
    }
  } catch {
    // Ignore IPC failures
  }
  
  // Fallback to native browser notification
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (window.Notification.permission !== 'granted') return
    const n = new window.Notification(title, { body, silent: false })
    n.onclick = () => {
      try {
        window.focus()
      } catch {
        /* ignore */
      }
    }
  } catch {
    // Ignore notification failures
  }
}

function requestAlarmPermission(): void {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (window.Notification.permission === 'default') {
      void window.Notification.requestPermission().catch(() => {})
    }
  } catch {
    // Ignore
  }
}

// High-Craft Gradient SVG Readiness Ring
function GrammarlyScoreRing({
  score,
  label,
  sublabel,
}: {
  score: number
  label: string
  sublabel: string
}) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
  const tone = score >= 90 ? 'Exceptional' : score >= 80 ? 'Strong' : 'Warming up'

  return (
    <div className="inner-highlight aurora-sheen relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1917] via-[#0F2420] to-[#0B1917] p-4 text-white ring-1 ring-white/10">
      <div className="animate-aurora-drift pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-[#15C39A]/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-28 rounded-full bg-indigo-500/10 blur-2xl" />
      <div className="relative flex items-center gap-3.5">
        <div className="relative flex size-20 shrink-0 items-center justify-center">
          <svg className="size-20 -rotate-90 transform" viewBox="0 0 88 88">
            <defs>
              <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D8E86C" />
                <stop offset="100%" stopColor="#7A9A1F" />
              </linearGradient>
            </defs>
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6.5"
              fill="transparent"
            />
            <motion.circle
              cx="44"
              cy="44"
              r={radius}
              stroke="url(#scoreRingGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              fill="transparent"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <SkiperAnimatedNumber
              value={score}
              className="font-mono text-xl font-extrabold tabular-nums text-white"
            />
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#15C39A]">
              Score
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#15C39A]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#15C39A] ring-1 ring-[#15C39A]/30">
            <span className="size-1 rounded-full bg-[#15C39A]" />
            {tone} • Ready
          </span>
          <h4 className="mt-1.5 truncate text-sm font-bold text-white">{label}</h4>
          <p className="mt-0.5 text-[11px] leading-snug text-emerald-100/70">{sublabel}</p>
        </div>
      </div>
    </div>
  )
}

export default function TalverinApp() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [name, setName] = useState('')
  const [occupation, setOccupation] = useState('University / College Student')
  const [capacity, setCapacity] = useState(360)
  const [wake, setWake] = useState('07:00')
  const [sleep, setSleep] = useState('23:00')
  const [morningWorkStart, setMorningWorkStart] = useState('11:00')
  const [afternoonWorkStart, setAfternoonWorkStart] = useState('16:00')
  const [customRoutineBlocks, setCustomRoutineBlocks] = useState<CustomRoutineBlock[]>(
    DEFAULT_CUSTOM_ROUTINE_BLOCKS,
  )
  const [routineNaturalText, setRoutineNaturalText] = useState(
    'I play badminton from 07:00 to 10:00, start work from 11:00, sleep from 13:00 to 14:30, and sit to work from 16:00 again.',
  )
  const [newRoutineStart, setNewRoutineStart] = useState('17:30')
  const [newRoutineEnd, setNewRoutineEnd] = useState('18:30')
  const [newRoutineTitle, setNewRoutineTitle] = useState('')

  const [showRoutineCustomizer, setShowRoutineCustomizer] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editStart, setEditStart] = useState('11:00')
  const [editEnd, setEditEnd] = useState('12:30')
  const [editTitle, setEditTitle] = useState('')
  const [autoResolveOverlaps, setAutoResolveOverlaps] = useState(true)
  const [showAddScheduleSlot, setShowAddScheduleSlot] = useState(false)
  const [customSlotTitle, setCustomSlotTitle] = useState('')
  const [customSlotStart, setCustomSlotStart] = useState('07:00')
  const [customSlotEnd, setCustomSlotEnd] = useState('10:00')
  const [customSlotType, setCustomSlotType] = useState<'routine' | 'deep-work'>('routine')

  const [profile, setProfile] = useState<{
    greeting: string
    personalizationSummary?: string
    focusCategories: string[]
    suggestedGoals: Array<Omit<Goal, 'id' | 'date' | 'priority'>>
  } | null>(null)
  const [activeCategory] = useState<string>('ALL')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<Omit<Goal, 'id' | 'date' | 'priority'>>>([])
  const [, setSuggestLoading] = useState(false)

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'g-initial-1',
      title: 'Learn Python from Shradha Khapra on Youtube',
      category: 'AI & Coding Mastery',
      description: 'Variables, data types, control flow, functions, OOP, and practice projects',
      estimatedHours: 14,
      date: addDaysYmd(14),
      priority: 'High',
    },
    {
      id: 'g-initial-2',
      title: 'Finish Google AI Essentials on Coursera',
      category: 'AI & Cloud Certifications',
      description: 'Complete all 5 modules, prompt engineering labs, and graded capstone assessment',
      estimatedHours: 12,
      date: addDaysYmd(15),
      priority: 'Medium',
    },
  ])

  const [loadingModal, setLoadingModal] = useState<{
    title: string
    subtitle: string
    steps: string[]
    visibleStepCount: number
  } | null>(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 2300)
    return () => window.clearTimeout(t)
  }, [])

  const [plan, setPlan] = useState<Plan | null>(null)
  // NOTE: both hydrate post-mount on purpose — reading browser state during
  // the first render would mismatch the prerendered HTML (React #418).
  const [reports, setReports] = useState<DayReport[]>([])
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [perfMode, setPerfMode] = useState<boolean>(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatTyping, setChatTyping] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<ChatMessage[]>([
    {
      id: 'chat-hello',
      role: 'assistant',
      content:
        "Hey, I'm Talverin — your study friend with full access to this app. Ask me how to improve today, tell me to move things around, change your wake time, capacity or routine, or manage goals — I'll just do it.",
    },
  ])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('talverin:reports:v1')
      const parsed = raw ? (JSON.parse(raw) as DayReport[]) : []
      if (Array.isArray(parsed) && parsed.length > 0) setReports(parsed)
    } catch {
      // Ignore storage failures
    }
    try {
      const saved = window.localStorage.getItem('talverin:perf')
      if (saved !== null) setPerfMode(saved === '1')
      else setPerfMode(/Electron/.test(window.navigator.userAgent))
    } catch {
      // Ignore storage failures
    }
    try {
      const raw = window.localStorage.getItem('talverin:session:v1')
      if (raw) {
        const s = JSON.parse(raw) as {
          plan?: Plan
          goals?: Goal[]
          customRoutineBlocks?: CustomRoutineBlock[]
          wake?: string
          sleep?: string
          morningWorkStart?: string
          afternoonWorkStart?: string
          capacity?: number
          name?: string
          occupation?: string
        }
        if (s && s.plan && Array.isArray(s.plan.fullDaySchedule) && s.plan.fullDaySchedule.length > 0) {
          setPlan(s.plan)
          if (Array.isArray(s.goals)) setGoals(s.goals)
          if (Array.isArray(s.customRoutineBlocks)) setCustomRoutineBlocks(s.customRoutineBlocks)
          if (typeof s.wake === 'string') setWake(s.wake)
          if (typeof s.sleep === 'string') setSleep(s.sleep)
          if (typeof s.morningWorkStart === 'string') setMorningWorkStart(s.morningWorkStart)
          if (typeof s.afternoonWorkStart === 'string') setAfternoonWorkStart(s.afternoonWorkStart)
          if (typeof s.capacity === 'number') setCapacity(s.capacity)
          if (typeof s.name === 'string') setName(s.name)
          if (typeof s.occupation === 'string') setOccupation(s.occupation)
          setSelectedDayIdx(0)
          setStep(6)
        }
      }
    } catch {
      // Corrupt session snapshots are ignored; onboarding starts fresh
    }
  }, [])
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [tab, setTab] = useState<'plan' | 'analysis' | 'roadmap' | 'reports' | 'settings' | 'chat'>('plan')
  const [recoveryBanner, setRecoveryBanner] = useState<string | null>(null)

  const [focusSecondsLeft, setFocusSecondsLeft] = useState<number>(90 * 60)
  const [focusPaused, setFocusPaused] = useState(false)

  const [studioContrastDark, setStudioContrastDark] = useState(false)
  const [showSkiperController, setShowSkiperController] = useState(false)
  const [skiperScale, setSkiperScale] = useState(0)
  const [skiperGap, setSkiperGap] = useState(0)
  const [, setSkiperFlexDir] = useState('row')

  const [alarmItem, setAlarmItem] = useState<ScheduleItem | null>(null)
  const stopAlarmRef = useRef<(() => void) | null>(null)
  const rangIdsRef = useRef<Set<string>>(new Set())
  const endedIdsRef = useRef<Set<string>>(new Set())
  const [clockStr, setClockStr] = useState<string>('')
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (step === 1) {
      window.setTimeout(() => nameInputRef.current?.focus(), 120)
    }
  }, [step])

  useEffect(() => {
    const updateClock = () => {
      setClockStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateClock()
    const id = window.setInterval(updateClock, 10000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!loadingModal) return
    const timer = window.setInterval(() => {
      setLoadingModal((prev) =>
        prev
          ? {
              ...prev,
              visibleStepCount: Math.min(prev.steps.length, prev.visibleStepCount + 1),
            }
          : null,
      )
    }, 520)
    return () => window.clearInterval(timer)
  }, [loadingModal !== null])

  const triggerAlarm = useCallback((item: ScheduleItem) => {
    if (stopAlarmRef.current) stopAlarmRef.current()
    stopAlarmRef.current = startLaptopAlarmLoop()
    setAlarmItem(item)
  }, [])

  const stopAlarm = useCallback(() => {
    if (stopAlarmRef.current) {
      stopAlarmRef.current()
      stopAlarmRef.current = null
    }
    setAlarmItem(null)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('talverin:reports:v1', JSON.stringify(reports))
    } catch {
      // Ignore storage failures
    }
  }, [reports])

  const persistSession = useCallback(() => {
    try {
      window.localStorage.setItem(
        'talverin:session:v1',
        JSON.stringify({
          plan,
          goals,
          customRoutineBlocks,
          wake,
          sleep,
          morningWorkStart,
          afternoonWorkStart,
          capacity,
          name,
          occupation,
        }),
      )
    } catch {
      // Ignore storage failures
    }
  }, [plan, goals, customRoutineBlocks, wake, sleep, morningWorkStart, afternoonWorkStart, capacity, name, occupation])

  useEffect(() => {
    if (!plan) return
    persistSession()
  }, [plan, persistSession])

  useEffect(() => {
    try {
      window.localStorage.setItem('talverin:perf', perfMode ? '1' : '0')
    } catch {
      // Ignore storage failures
    }
  }, [perfMode])

  // Ask once for OS notification permission so alarms survive backgrounding.
  useEffect(() => {
    if (!plan || step !== 6) return
    requestAlarmPermission()
  }, [plan !== null, step])

  useEffect(() => {
    if (!plan) return
    const iso = todayIso()
    const found = plan.fullDaySchedule.findIndex((d) => d.date === iso)
    const todayIdx = found >= 0 ? found : 0
    const watchIdxs = Array.from(new Set([todayIdx, selectedDayIdx]))
    const watchItems = watchIdxs.flatMap((idx) =>
      (plan.fullDaySchedule[idx]?.items || []).map((it) => ({ dayIdx: idx, it })),
    )
    if (!watchItems.length) return
    const timer = window.setInterval(() => {
      const nowM = hhmmToMins(nowHhmm())
      const inWindow = (t: string, mins: number) => {
        const s = hhmmToMins(t)
        return s <= nowM && nowM < s + mins
      }
      // Start alarm: rings inside a 2-minute window so throttled timers can't miss it.
      const match = watchItems.find(
        ({ it }) =>
          it.type === 'deep-work' &&
          it.status === 'PLANNED' &&
          inWindow(it.start, 2) &&
          !rangIdsRef.current.has(it.id),
      )
      if (match) {
        rangIdsRef.current.add(match.it.id)
        triggerAlarm(match.it)
        notifyAlarm(
          `Time to start: ${formatTaskTitle(match.it.title).headline}`,
          `${match.it.start}–${match.it.end} · ${match.it.durationMinutes} min focus`,
          { id: match.it.id, startTime: match.it.start, title: formatTaskTitle(match.it.title).headline, duration: match.it.durationMinutes, type: 'start' },
        )
      }
      // End chime + auto-mark done, also windowed.
      const ended = watchItems.find(
        ({ it }) =>
          it.type === 'deep-work' &&
          (it.status === 'IN_PROGRESS' || it.status === 'PLANNED') &&
          inWindow(it.end, 2) &&
          !endedIdsRef.current.has(it.id),
      )
      if (ended) {
        endedIdsRef.current.add(ended.it.id)
        playSingleChime()
        notifyAlarm(
          `Session complete: ${formatTaskTitle(ended.it.title).headline}`,
          'Marked done. Take a breath before the next block.',
          { id: ended.it.id, startTime: ended.it.start, title: formatTaskTitle(ended.it.title).headline, duration: ended.it.durationMinutes, type: 'end' },
        )
        setPlan((prev) => {
          if (!prev) return prev
          const updatedDays = prev.fullDaySchedule.map((day, idx) => {
            if (idx !== ended.dayIdx) return day
            return {
              ...day,
              items: day.items.map((it) =>
                it.id === ended.it.id ? { ...it, status: 'DONE' as const } : it,
              ),
            }
          })
          return { ...prev, fullDaySchedule: updatedDays }
        })
        toast.success(`Session ended — marked done: ${formatTaskTitle(ended.it.title).headline}`)
      }
      // Catch-up: unstarted blocks whose whole window already passed today
      // get one MISSED + evening-recovery pass instead of silence.
      const today = plan.fullDaySchedule[todayIdx]
      if (today && today.date === iso) {
        const overdue = today.items.filter(
          (it) =>
            it.type === 'deep-work' &&
            it.status === 'PLANNED' &&
            hhmmToMins(it.end) <= nowM &&
            !rangIdsRef.current.has(`missed-${it.id}`),
        )
        if (overdue.length > 0) {
          for (const it of overdue) rangIdsRef.current.add(`missed-${it.id}`)
          const stamp = Date.now()
          setPlan((prev) => {
            if (!prev) return prev
            const ids = new Set(overdue.map((o) => o.id))
            const updatedDays = prev.fullDaySchedule.map((day, idx) => {
              if (idx !== todayIdx) return day
              const nextItems = day.items.map((it) =>
                ids.has(it.id) ? { ...it, status: 'MISSED' as const } : it,
              )
              overdue.forEach((src, k) => {
                nextItems.push({
                  id: `${src.id}-recovered-${stamp}-${k}`,
                  start: '21:30',
                  end: '23:00',
                  durationMinutes: src.durationMinutes,
                  title: `Rescheduled: ${src.title}`,
                  type: 'deep-work',
                  goal: src.goal,
                  deadline: src.deadline,
                  status: 'PLANNED',
                })
              })
              return { ...day, items: nextItems }
            })
            return { ...prev, fullDaySchedule: updatedDays }
          })
          const first = overdue[0]
          setRecoveryBanner(
            `Moved ${overdue.length} missed session${overdue.length === 1 ? '' : 's'} into your 21:30–23:00 evening recovery window.`,
          )
          notifyAlarm(
            `You missed ${overdue.length} session${overdue.length === 1 ? '' : 's'} — moved to this evening`,
            `Starting with “${formatTaskTitle(first.title).headline}” at 21:30.`,
            { id: first.id, startTime: '21:30', title: formatTaskTitle(first.title).headline, duration: first.durationMinutes, type: 'missed' },
          )
        }
      }
    }, 15000)
    return () => window.clearInterval(timer)
  }, [plan, selectedDayIdx, triggerAlarm])

  // Day briefing: once per date, when the waking day is already underway.
  useEffect(() => {
    if (!plan || step !== 6 || selectedDayIdx !== 0 || briefing) return
    const today = plan.fullDaySchedule[0]
    if (!today) return
    const pct = dayProgressPct(wake, sleep)
    const remaining = today.items.filter((i) => i.type === 'deep-work' && i.status === 'PLANNED')
    if (pct < 0.15 || remaining.length === 0) return
    try {
      if (window.localStorage.getItem(`talverin:briefed:${today.date}`)) return
    } catch {
      return
    }
    const remainingMins = remaining.reduce((a, i) => a + (i.durationMinutes || 0), 0)
    const upcoming = [...remaining].sort((a, b) => (a.start < b.start ? -1 : 1))[0]
    setBriefing({
      date: today.date,
      pct,
      remainingCount: remaining.length,
      remainingMinutes: remainingMins,
      nextTitle: upcoming ? formatTaskTitle(upcoming.title).headline : 'Remaining focus blocks',
      nextStart: upcoming ? upcoming.start : '',
    })
  }, [plan, step, selectedDayIdx, wake, sleep, briefing])

  // Auto-generate the day report once every deep-work block is settled.
  useEffect(() => {
    if (!plan || step !== 6) return
    const today = plan.fullDaySchedule[0]
    if (!today) return
    const deep = today.items.filter((i) => i.type === 'deep-work')
    if (deep.length === 0) return
    if (deep.some((i) => i.status === 'PLANNED' || i.status === 'IN_PROGRESS')) return
    if (!deep.some((i) => i.status === 'DONE')) return
    if (reports.some((r) => r.date === today.date)) return
    const rep = buildDayReport(today, goals)
    setReports((prev) => [rep, ...prev])
    toast.success(`Day complete — ${rep.completionPct}% · report ready in Day Reports`)
  }, [plan, step, reports, goals])

  const activeDay = plan?.fullDaySchedule?.[selectedDayIdx] || plan?.fullDaySchedule?.[0]
  const activeItems = activeDay?.items || []
  const activeFocusItem = activeItems.find((i) => i.status === 'IN_PROGRESS') || null

  useEffect(() => {
    if (!activeFocusItem || focusPaused) return
    const id = window.setInterval(() => {
      setFocusSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [activeFocusItem, focusPaused])

  useEffect(() => {
    const clean = query.trim()
    if (clean.length < 2) {
      setSuggestions([])
      setSuggestLoading(false)
      return
    }
    let cancelled = false
    setSuggestLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const r = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'suggest_goals', query: clean, occupation }),
        })
        const data = await r.json()
        if (!cancelled && Array.isArray(data.goals)) {
          setSuggestions(data.goals)
        }
      } catch {
        if (!cancelled) {
          setSuggestions([
            {
              title: `Complete ${clean} (Full Syllabus & Hands-On Practice)`,
              category: 'Custom AI Goal',
              estimatedHours: 12,
              description: `Structured completion plan for "${clean}" researched via Tavily.`,
            },
          ])
        }
      } finally {
        if (!cancelled) setSuggestLoading(false)
      }
    }, 320)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query, occupation])

  const displayName = name.trim() || 'Shoumik'

  const repackScheduleAroundRoutine = useCallback(
    (
      nextRoutineBlocks: CustomRoutineBlock[],
      nextMorningStart: string,
      nextAfternoonStart: string,
      currentPlan: Plan | null,
      overrides?: { wake?: string; sleep?: string; capacity?: number },
    ) => {
      if (!currentPlan) return
      const effWake = overrides?.wake ?? wake
      const effSleep = overrides?.sleep ?? sleep
      const effCapacity = overrides?.capacity ?? capacity
      const openSlots = computeOpenDeepWorkSlotsClient({
        wakeTime: effWake,
        sleepTime: effSleep,
        morningWorkStart: nextMorningStart,
        afternoonWorkStart: nextAfternoonStart,
        routineBlocks: nextRoutineBlocks,
        dailyWorkMinutes: effCapacity,
      })

      const nextFullDaySchedule: DaySchedule[] = currentPlan.fullDaySchedule.map((day) => {
        const existingDeepWork = day.items.filter((i) => i.type === 'deep-work')
        const routineItems: ScheduleItem[] = nextRoutineBlocks.map((rb, idx) => ({
          id: `${day.date}-routine-custom-${idx}`,
          start: rb.start,
          end: rb.end,
          durationMinutes: Math.max(15, hhmmToMins(rb.end) - hhmmToMins(rb.start)),
          title: rb.title,
          type: 'routine',
          status: 'PLANNED',
        }))

        let dayGoalMins = 0
        const reassignedDeepWork: ScheduleItem[] = openSlots.map((slot, idx) => {
          const sourceTask = existingDeepWork[idx % Math.max(1, existingDeepWork.length)]
          dayGoalMins += slot.duration
          return {
            id: sourceTask?.id || `${day.date}-goal-refit-${idx}`,
            start: slot.start,
            end: slot.end,
            durationMinutes: slot.duration,
            title: sourceTask?.title || `Deep-Work Goal Session #${idx + 1}`,
            type: 'deep-work',
            goal: sourceTask?.goal || goals[0]?.title || 'Personal Goal',
            deadline: sourceTask?.deadline || day.date,
            status: sourceTask?.status || 'PLANNED',
          }
        })

        const combined = [...routineItems, ...reassignedDeepWork].sort((a, b) =>
          a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
        )
        return {
          ...day,
          totalGoalMinutes: dayGoalMins,
          items: combined,
        }
      })

      setPlan({
        ...currentPlan,
        fullDaySchedule: nextFullDaySchedule,
      })
      toast.success(
        `Re-allotted AI tasks around your routine (Work starts ${nextMorningStart} & ${nextAfternoonStart})`,
      )
    },
    [wake, sleep, capacity, goals],
  )

  const applyChatOperations = (
    ops: ChatOp[],
  ): { applied: number; noteParts: string[]; skippedParts: string[]; repacked: boolean } => {
    let appliedCount = 0
    const noteParts: string[] = []
    const skippedParts: string[] = []
    const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/
    const validPriority = (p: unknown): Goal['priority'] | undefined =>
      p === 'High' || p === 'Medium' || p === 'Normal' ? p : undefined
    const validDate = (d: unknown): string | undefined =>
      typeof d === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      !Number.isNaN(new Date(`${d}T00:00`).getTime())
        ? d
        : undefined
    const matchGoal = (find: string) => {
      const q = find.trim().toLowerCase()
      if (!q) return undefined
      return (
        goals.find((g) => g.title.toLowerCase() === q) ||
        goals.find((g) => g.title.toLowerCase().includes(q))
      )
    }
    const removedGoalIds = new Set<string>()

    let nextWake = wake
    let nextSleep = sleep
    let nextCapacity = capacity
    let nextMorning = morningWorkStart
    let nextAfternoon = afternoonWorkStart
    let nextRoutine = customRoutineBlocks
    let needsRepack = false
    let repacked = false
    const schedOps: Array<ChatOp & { day?: number }> = []

    for (const op of ops) {
      if (!op || typeof op !== 'object' || typeof (op as { op?: unknown }).op !== 'string') continue
      switch ((op as { op: string }).op) {
        case 'set_wake':
        case 'set_sleep':
        case 'set_morning_start':
        case 'set_afternoon_start': {
          const to = String((op as { to?: unknown }).to || '')
          if (!TIME_RE.test(to)) {
            skippedParts.push('a time change (needs HH:MM)')
            break
          }
          if (op.op === 'set_wake') {
            nextWake = to
            setWake(to)
            noteParts.push(`wake-up set to ${to}`)
          } else if (op.op === 'set_sleep') {
            nextSleep = to
            setSleep(to)
            noteParts.push(`bedtime set to ${to}`)
          } else if (op.op === 'set_morning_start') {
            nextMorning = to
            setMorningWorkStart(to)
            noteParts.push(`morning work starts ${to}`)
          } else {
            nextAfternoon = to
            setAfternoonWorkStart(to)
            noteParts.push(`afternoon work resumes ${to}`)
          }
          appliedCount++
          needsRepack = true
          break
        }
        case 'set_capacity': {
          const m = Math.round(Number((op as { minutes?: unknown }).minutes))
          if (!Number.isFinite(m) || m < 60 || m > 720) {
            skippedParts.push('capacity change (use 60–720 minutes)')
            break
          }
          nextCapacity = m
          setCapacity(m)
          noteParts.push(`daily capacity set to ${(m / 60).toFixed(1)}h`)
          appliedCount++
          needsRepack = true
          break
        }
        case 'add_routine': {
          const o = op as Extract<ChatOp, { op: 'add_routine' }>
          const title = (o.title || '').trim()
          if (!title || !TIME_RE.test(o.start || '') || !TIME_RE.test(o.end || '') || hhmmToMins(o.end) <= hhmmToMins(o.start)) {
            skippedParts.push('a routine add (need a title and valid times)')
            break
          }
          const cat = (['sport', 'sleep', 'meal'] as string[]).includes(o.category || '')
            ? (o.category as CustomRoutineBlock['category'])
            : ('routine' as const)
          nextRoutine = [
            ...nextRoutine,
            { id: `chat-rb-${Date.now()}`, start: o.start, end: o.end, title, category: cat },
          ].sort((a, b) => (a.start < b.start ? -1 : 1))
          noteParts.push(`added routine “${title}” ${o.start}–${o.end}`)
          appliedCount++
          needsRepack = true
          break
        }
        case 'remove_routine': {
          const raw = String((op as { find?: unknown }).find || '')
          const q = raw.trim().toLowerCase()
          const hit =
            nextRoutine.find((b) => b.title.toLowerCase().includes(q)) ||
            nextRoutine.find((b) => b.start === raw.trim())
          if (!q || !hit) {
            skippedParts.push(`routine “${raw || '?'}” (not found)`)
            break
          }
          nextRoutine = nextRoutine.filter((b) => b.id !== hit.id)
          noteParts.push(`removed routine “${hit.title}”`)
          appliedCount++
          needsRepack = true
          break
        }
        case 'add_goal': {
          const o = op as Extract<ChatOp, { op: 'add_goal' }>
          const title = (o.title || '').trim()
          if (!title) {
            skippedParts.push('a goal add (needs a title)')
            break
          }
          const g: Goal = {
            id: `goal-chat-${Date.now()}`,
            title,
            category: (o.category || 'Custom Personal Goal').toString(),
            description: 'Added via AI chat.',
            estimatedHours: Number.isFinite(Number(o.estimatedHours)) ? Number(o.estimatedHours) : 12,
            date: validDate(o.date) ?? addDaysYmd(10),
            priority: validPriority(o.priority) ?? 'Medium',
          }
          setGoals((prev) => [...prev, g])
          noteParts.push(`added goal “${title}”`)
          appliedCount++
          break
        }
        case 'remove_goal': {
          const t = matchGoal(String((op as { find?: unknown }).find || ''))
          if (!t || removedGoalIds.has(t.id)) {
            skippedParts.push(`goal “${String((op as { find?: unknown }).find || '?')}” (not found)`)
            break
          }
          removedGoalIds.add(t.id)
          setGoals((prev) => prev.filter((g) => g.id !== t.id))
          noteParts.push(`removed goal “${t.title}”`)
          appliedCount++
          break
        }
        case 'set_priority': {
          const t = matchGoal(String((op as { find?: unknown }).find || ''))
          const p = validPriority((op as { priority?: unknown }).priority)
          if (!t || removedGoalIds.has(t.id) || !p) {
            skippedParts.push('a priority change (need a known goal + High/Medium/Normal)')
            break
          }
          setGoals((prev) => prev.map((g) => (g.id === t.id ? { ...g, priority: p } : g)))
          noteParts.push(`“${t.title}” set to ${p} priority`)
          appliedCount++
          break
        }
        case 'set_deadline': {
          const t = matchGoal(String((op as { find?: unknown }).find || ''))
          const d = validDate((op as { date?: unknown }).date)
          if (!t || removedGoalIds.has(t.id) || !d) {
            skippedParts.push('a deadline change (need a known goal + YYYY-MM-DD date)')
            break
          }
          setGoals((prev) => prev.map((g) => (g.id === t.id ? { ...g, date: d } : g)))
          noteParts.push(`“${t.title}” due ${d}`)
          appliedCount++
          break
        }
        case 'set_theme': {
          const theme = String((op as { theme?: unknown }).theme || '').toLowerCase()
          if (theme !== 'light' && theme !== 'dark') {
            skippedParts.push('theme change (use light or dark)')
            break
          }
          setStudioContrastDark(theme === 'dark')
          noteParts.push(`theme set to ${theme}`)
          appliedCount++
          break
        }
        case 'set_perf': {
          const on = !!(op as { on?: unknown }).on
          setPerfMode(on)
          noteParts.push(`performance mode ${on ? 'on' : 'off'}`)
          appliedCount++
          break
        }
        default:
          schedOps.push(op as ChatOp & { day?: number })
          break
      }
    }
    setCustomRoutineBlocks(nextRoutine)

    if (plan && schedOps.length > 0) {
      const byDay = new Map<number, Array<ChatOp & { day?: number }>>()
      for (const op of schedOps) {
        const rawDay = (op as { day?: unknown }).day
        const d =
          typeof rawDay === 'number' && plan.fullDaySchedule[rawDay] ? rawDay : selectedDayIdx
        if (!byDay.has(d)) byDay.set(d, [])
        byDay.get(d)!.push(op)
      }
      const nextDays = plan.fullDaySchedule.map((day, idx) => {
        const group = byDay.get(idx)
        if (!group) return day
        const result = applyChatOps(day.items, group, goals)
        result.applied.forEach((a) => noteParts.push(a))
        result.skipped.forEach((s) => skippedParts.push(s))
        appliedCount += result.applied.length
        return { ...day, items: result.items, totalGoalMinutes: result.totalGoalMinutes }
      })
      if (needsRepack) {
        repackScheduleAroundRoutine(nextRoutine, nextMorning, nextAfternoon, {
          ...plan,
          fullDaySchedule: nextDays,
        }, { wake: nextWake, sleep: nextSleep, capacity: nextCapacity })
        repacked = true
      } else {
        setPlan({ ...plan, fullDaySchedule: nextDays })
      }
    } else if (needsRepack && plan) {
      repackScheduleAroundRoutine(nextRoutine, nextMorning, nextAfternoon, plan, {
        wake: nextWake,
        sleep: nextSleep,
        capacity: nextCapacity,
      })
      repacked = true
    }
    return { applied: appliedCount, noteParts, skippedParts, repacked }
  }

  const sendChat = useCallback(
    async (text: string, images?: string[], files?: { name: string; type: string; size: number; data: string }[]) => {
      const clean = text.trim()
      if (!clean && (!images || images.length === 0) && (!files || files.length === 0) || chatTyping) return
      const userMsg: ChatMessage = {
        id: `chat-${Date.now()}-u`,
        role: 'user',
        content: clean,
        images,
        files,
      }
      setChatMsgs((prev) => [...prev.slice(-19), userMsg])
      setChatTyping(true)
      try {
        const history = [...chatMsgs.slice(-11), userMsg].map((m) => ({
          role: m.role === 'system' ? 'assistant' : m.role,
          content: m.content,
        }))
        const dayItems = (plan?.fullDaySchedule?.[selectedDayIdx]?.items || []).map((i) => ({
          start: i.start,
          end: i.end,
          title: i.title,
          type: i.type,
          status: i.status,
        }))
        const r = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            messages: history,
            name: displayName,
            occupation,
            goals: goals.map((g) => ({
              title: g.title,
              category: g.category,
              estimatedHours: g.estimatedHours,
              date: g.date,
              priority: g.priority,
            })),
            todayItems: dayItems,
            dayIndex: selectedDayIdx,
            settings: {
              wakeTime: wake,
              sleepTime: sleep,
              morningWorkStart,
              afternoonWorkStart,
              dailyWorkMinutes: capacity,
              routineBlocks: customRoutineBlocks,
            },
            weekOverview: (plan?.fullDaySchedule || []).slice(0, 7).map((d) => ({
              date: d.date,
              deepBlocks: d.items.filter((i) => i.type === 'deep-work').length,
              minutes: d.totalGoalMinutes,
            })),
          }),
        })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Chat failed')
        const replyText = String(data.reply || 'Noted — anything else?')
        const ops = (Array.isArray(data.ops || data.scheduleOps) ? data.ops || data.scheduleOps : []) as ChatOp[]
        const opResult = applyChatOperations(ops)
        const appliedCount = opResult.applied
        if (opResult.noteParts.length > 0 || opResult.skippedParts.length > 0) {
          const bits: string[] = []
          if (opResult.noteParts.length > 0) bits.push(`Updated: ${opResult.noteParts.join('; ')}`)
          if (opResult.skippedParts.length > 0) bits.push(`Skipped: ${opResult.skippedParts.join('; ')}`)
          setChatMsgs((prev) => [
            ...prev,
            { id: `chat-${Date.now()}-sys`, role: 'system', content: bits.join(' · ') },
          ])
          if (appliedCount > 0 && !opResult.repacked) {
            toast.success(
              `Schedule updated (${appliedCount} change${appliedCount === 1 ? '' : 's'}) — roadmap, timeline and reports all read the same plan`,
            )
          }
        }
        if (
          appliedCount === 0 &&
          (/\b(updated|moved|rescheduled|marked done|marked complete|changed|deleted|added|done!)\b/i.test(
            replyText,
          ) ||
            /(added to|on|updated) your (roadmap|schedule|timeline)/i.test(replyText))
        ) {          setChatMsgs((prev) => [
            ...prev,
            {
              id: `chat-${Date.now()}-sys`,
              role: 'system',
              content:
                'Heads up: nothing on the timeline actually changed. Tell me the exact task name or a time, e.g. “move gym to 18:30”.',
            },
          ])
        }
        setChatMsgs((prev) => [
          ...prev,
          {
            id: `chat-${Date.now()}-a`,
            role: 'assistant',
            content: replyText,
          },
        ])
      } catch (e) {
        setChatMsgs((prev) => [
          ...prev,
          {
            id: `chat-${Date.now()}-err`,
            role: 'assistant',
            content: `Hmm, I lost connection for a second (${e instanceof Error ? e.message : 'network hiccup'}). Your schedule is untouched — try again?`,
          },
        ])
      } finally {
        setChatTyping(false)
      }
    },
    [chatTyping, chatMsgs, plan, selectedDayIdx, displayName, occupation, goals],
  )

  const repackRemainingToday = useCallback(() => {    if (!plan) return
    const today = plan.fullDaySchedule[0]
    if (!today) return
    const nowM = hhmmToMins(nowHhmm())
    const openSlots = computeOpenDeepWorkSlotsClient({
      wakeTime: wake,
      sleepTime: sleep,
      morningWorkStart,
      afternoonWorkStart,
      routineBlocks: customRoutineBlocks,
      dailyWorkMinutes: capacity,
    })
      .filter((s) => hhmmToMins(s.end) > nowM + 5)
      .map((s) =>
        hhmmToMins(s.start) < nowM
          ? { ...s, start: minsToHhmm(nowM + 5), duration: s.duration - (nowM + 5 - hhmmToMins(s.start)) }
          : s,
      )
      .filter((s) => s.duration >= 25)

    const kept = today.items.filter(
      (i) => i.type === 'routine' || i.status === 'DONE' || i.status === 'IN_PROGRESS',
    )
    const pending = today.items
      .filter((i) => i.type === 'deep-work' && i.status === 'PLANNED')
      .sort((a, b) => (a.start < b.start ? -1 : 1))

    const fitted: ScheduleItem[] = openSlots.slice(0, pending.length).map((slot, idx) => {
      const src = pending[idx]
      return {
        id: src.id,
        start: slot.start,
        end: slot.end,
        durationMinutes: slot.duration,
        title: src.title,
        type: 'deep-work',
        goal: src.goal,
        deadline: src.deadline,
        status: 'PLANNED' as const,
      }
    })
    const overflowStart = 21 * 60 + 30
    const overflowed: ScheduleItem[] = pending.slice(openSlots.length).map((src, k) => {
      const s = overflowStart + k * (src.durationMinutes + 10)
      return {
        ...src,
        start: minsToHhmm(s),
        end: minsToHhmm(s + src.durationMinutes),
      }
    })

    const combined = [...kept, ...fitted, ...overflowed].sort((a, b) =>
      a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
    )
    const nextDays = plan.fullDaySchedule.map((day, idx) =>
      idx === 0
        ? {
            ...day,
            totalGoalMinutes: combined
              .filter((i) => i.type === 'deep-work')
              .reduce((a, i) => a + (i.durationMinutes || 0), 0),
            items: combined,
          }
        : day,
    )
    setPlan({ ...plan, fullDaySchedule: nextDays })
    setSelectedDayIdx(0)
    if (overflowed.length > 0) {
      setRecoveryBanner(
        `${overflowed.length} task${overflowed.length > 1 ? 's' : ''} moved into your 21:30+ evening overflow — the rest fit before bedtime.`,
      )
    }
    toast.success(`Re-fitted ${fitted.length} remaining session${fitted.length === 1 ? '' : 's'} into today's open windows`)
  }, [plan, wake, sleep, morningWorkStart, afternoonWorkStart, customRoutineBlocks, capacity])

  const addCustomRoutineBlock = () => {
    const cleanTitle = newRoutineTitle.trim()
    if (!cleanTitle) {
      toast.error('Please enter an activity name (e.g., Play Badminton, Afternoon Sleep).')
      return
    }
    if (hhmmToMins(newRoutineEnd) <= hhmmToMins(newRoutineStart)) {
      toast.error('End time must be after start time.')
      return
    }
    const nextBlocks = [
      ...customRoutineBlocks,
      {
        id: `custom-rb-${Date.now()}`,
        start: newRoutineStart,
        end: newRoutineEnd,
        title: cleanTitle,
        category: 'routine' as const,
      },
    ].sort((a, b) => a.start.localeCompare(b.start))
    setCustomRoutineBlocks(nextBlocks)
    setNewRoutineTitle('')
    if (plan) {
      repackScheduleAroundRoutine(nextBlocks, morningWorkStart, afternoonWorkStart, plan)
    } else {
      toast.success(`Added "${cleanTitle}" (${newRoutineStart}–${newRoutineEnd})`)
    }
  }

  const updateRoutineBlockField = (
    id: string,
    field: 'start' | 'end' | 'title',
    value: string,
  ) => {
    const nextBlocks = customRoutineBlocks
      .map((rb) => (rb.id === id ? { ...rb, [field]: value } : rb))
      .sort((a, b) => a.start.localeCompare(b.start))
    setCustomRoutineBlocks(nextBlocks)
  }

  const removeRoutineBlock = (id: string) => {
    const nextBlocks = customRoutineBlocks.filter((rb) => rb.id !== id)
    setCustomRoutineBlocks(nextBlocks)
    if (plan) {
      repackScheduleAroundRoutine(nextBlocks, morningWorkStart, afternoonWorkStart, plan)
    }
  }

  const handleParseNaturalRoutine = async () => {
    if (!routineNaturalText.trim()) return
    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_routine',
          text: routineNaturalText,
        }),
      })
      const data = await r.json()
      const nextMorning = data.morningWorkStart || morningWorkStart
      const nextAfternoon = data.afternoonWorkStart || afternoonWorkStart
      const nextBlocks =
        Array.isArray(data.routineBlocks) && data.routineBlocks.length > 0
          ? data.routineBlocks
          : customRoutineBlocks
      setMorningWorkStart(nextMorning)
      setAfternoonWorkStart(nextAfternoon)
      setCustomRoutineBlocks(nextBlocks)
      if (plan) {
        repackScheduleAroundRoutine(nextBlocks, nextMorning, nextAfternoon, plan)
      } else {
        toast.success('Parsed your daily routine & work start windows!')
      }
    } catch {
      if (plan) {
        repackScheduleAroundRoutine(
          customRoutineBlocks,
          morningWorkStart,
          afternoonWorkStart,
          plan,
        )
      }
    }
  }

  const startEditingItem = (item: ScheduleItem) => {
    setEditingItemId(item.id)
    setEditStart(item.start)
    setEditEnd(item.end)
    setEditTitle(item.title)
  }

  const saveEditedScheduleItem = (itemId: string) => {
    if (!plan) return
    const startM = hhmmToMins(editStart)
    const endM = hhmmToMins(editEnd)
    if (endM <= startM) {
      toast.error('End time must be after start time.')
      return
    }
    const newDuration = endM - startM

    const updatedDays = plan.fullDaySchedule.map((day, dIdx) => {
      if (dIdx !== selectedDayIdx) return day
      const items = day.items.map((it) =>
        it.id === itemId
          ? {
              ...it,
              start: editStart,
              end: editEnd,
              durationMinutes: newDuration,
              title: editTitle.trim() || it.title,
            }
          : { ...it },
      )

      items.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))

      if (autoResolveOverlaps) {
        for (let i = 0; i < items.length - 1; i++) {
          const currEnd = hhmmToMins(items[i].end)
          const nextStart = hhmmToMins(items[i + 1].start)
          if (currEnd > nextStart && items[i + 1].type === 'deep-work') {
            const dur = items[i + 1].durationMinutes || 90
            items[i + 1].start = minsToHhmm(currEnd)
            items[i + 1].end = minsToHhmm(currEnd + dur)
          }
        }
        items.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
      }

      const totalGoalMinutes = items
        .filter((i) => i.type === 'deep-work')
        .reduce((acc, i) => acc + (i.durationMinutes || 90), 0)

      return { ...day, totalGoalMinutes, items }
    })

    setPlan({ ...plan, fullDaySchedule: updatedDays })
    setEditingItemId(null)
    toast.success(`Updated timing to ${editStart} – ${editEnd}`)
  }

  const shiftScheduleItemTime = (item: ScheduleItem, newStartHhmm: string) => {
    if (!plan) return
    const dur = item.durationMinutes || 90
    const startM = hhmmToMins(newStartHhmm)
    const endHhmm = minsToHhmm(startM + dur)

    const updatedDays = plan.fullDaySchedule.map((day, dIdx) => {
      if (dIdx !== selectedDayIdx) return day
      const items = day.items
        .map((it) => (it.id === item.id ? { ...it, start: newStartHhmm, end: endHhmm } : it))
        .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
      return { ...day, items }
    })

    setPlan({ ...plan, fullDaySchedule: updatedDays })
    if (editingItemId === item.id) {
      setEditStart(newStartHhmm)
      setEditEnd(endHhmm)
    }
    toast.success(`Moved task to ${newStartHhmm} – ${endHhmm}`)
  }

  const deleteScheduleItem = (itemId: string) => {
    if (!plan) return
    const updatedDays = plan.fullDaySchedule.map((day, dIdx) => {
      if (dIdx !== selectedDayIdx) return day
      const items = day.items.filter((it) => it.id !== itemId)
      const totalGoalMinutes = items
        .filter((i) => i.type === 'deep-work')
        .reduce((acc, i) => acc + (i.durationMinutes || 90), 0)
      return { ...day, totalGoalMinutes, items }
    })
    setPlan({ ...plan, fullDaySchedule: updatedDays })
    toast.info('Removed slot from schedule')
  }

  const handleAddCustomSlotToSchedule = () => {
    if (!plan) return
    const clean = customSlotTitle.trim()
    if (!clean) {
      toast.error('Please enter a title for the slot.')
      return
    }
    const sMins = hhmmToMins(customSlotStart)
    const eMins = hhmmToMins(customSlotEnd)
    if (eMins <= sMins) {
      toast.error('End time must be after start time.')
      return
    }
    const newItem: ScheduleItem = {
      id: `custom-slot-${Date.now()}`,
      start: customSlotStart,
      end: customSlotEnd,
      durationMinutes: eMins - sMins,
      title: clean,
      type: customSlotType,
      goal: customSlotType === 'deep-work' ? goals[0]?.title || 'Custom Goal' : undefined,
      status: 'PLANNED',
    }

    if (customSlotType === 'routine') {
      const nextRoutine = [
        ...customRoutineBlocks,
        {
          id: `rb-${Date.now()}`,
          start: customSlotStart,
          end: customSlotEnd,
          title: clean,
          category: 'routine' as const,
        },
      ].sort((a, b) => a.start.localeCompare(b.start))
      setCustomRoutineBlocks(nextRoutine)
      repackScheduleAroundRoutine(nextRoutine, morningWorkStart, afternoonWorkStart, plan)
    } else {
      const updatedDays = plan.fullDaySchedule.map((day, dIdx) => {
        if (dIdx !== selectedDayIdx) return day
        const items = [...day.items, newItem].sort((a, b) =>
          a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
        )
        const totalGoalMinutes = items
          .filter((i) => i.type === 'deep-work')
          .reduce((acc, i) => acc + (i.durationMinutes || 90), 0)
        return { ...day, totalGoalMinutes, items }
      })
      setPlan({ ...plan, fullDaySchedule: updatedDays })
      toast.success(`Added "${clean}" (${customSlotStart} – ${customSlotEnd})`)
    }

    setCustomSlotTitle('')
    setShowAddScheduleSlot(false)
  }

  const handleQuestion1Next = () => {
    if (!name.trim()) {
      setName('Shoumik')
    }
    setStep(2)
  }

  const handleQuestion2Next = async () => {
    if (!occupation) {
      toast.error('Please select your occupation category first.')
      return
    }

    setLoadingModal({
      title: `Calibrating Assistant for ${displayName}`,
      subtitle: `NVIDIA Nemotron-3.5-Lightning • Tailoring Goals for ${occupation}`,
      steps: [
        `Connecting to NVIDIA Nemotron-3.5-Lightning for ${displayName}...`,
        `Building domain-specific goal library for ${occupation}...`,
        'Preparing daily routine & work-window customization studio...',
      ],
      visibleStepCount: 1,
    })

    const minWait = new Promise((r) => setTimeout(r, 1200))
    try {
      const [res] = await Promise.all([
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'personalize_role',
            name: displayName,
            occupation,
            dailyHoursLabel: CAPACITY_CARDS.find((c) => c.minutes === capacity)?.label,
          }),
        }),
        minWait,
      ])
      const data = await res.json()
      if (res.ok && Array.isArray(data.suggestedGoals) && data.suggestedGoals.length > 0) {
        setProfile(data)
        setGoals(
          data.suggestedGoals.slice(0, 2).map(
            (
              g: { title: string; category: string; description: string; estimatedHours: number },
              idx: number,
            ) => ({
              id: `ai-goal-${idx}-${Date.now()}`,
              title: g.title,
              category: g.category || 'Personal Focus',
              description: g.description || 'Role-tailored milestone',
              estimatedHours: Number(g.estimatedHours || 12),
              date: addDaysYmd(10 + idx * 7),
              priority: idx === 0 ? 'High' : 'Medium',
            }),
          ),
        )
      } else {
        throw new Error(data.error || 'Fallback')
      }
    } catch {
      const defaults =
        ROLE_DEFAULT_GOALS[occupation] || ROLE_DEFAULT_GOALS['University / College Student']
      setProfile({
        greeting: `Hi ${displayName}! Your assistant is calibrated for a ${occupation}.`,
        focusCategories: Array.from(new Set(defaults.map((d) => d.category))),
        suggestedGoals: defaults,
      })
    } finally {
      setLoadingModal(null)
      setStep(3)
    }
  }

  const toggleGoal = (item: {
    title: string
    category?: string
    description?: string
    estimatedHours?: number
  }) => {
    const cleanTitle = item.title.trim()
    if (!cleanTitle) return
    const exists = goals.some((g) => g.title.toLowerCase() === cleanTitle.toLowerCase())
    if (exists) {
      setGoals(goals.filter((g) => g.title.toLowerCase() !== cleanTitle.toLowerCase()))
      toast.info(`Removed "${cleanTitle}"`)
    } else {
      setGoals([
        ...goals,
        {
          id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: cleanTitle,
          category: item.category || 'Custom Personal Goal',
          description:
            item.description ||
            `Researched via Tavily & decomposed into daily modules by NVIDIA Nemotron.`,
          estimatedHours: Number(item.estimatedHours || 12),
          date: addDaysYmd(10 + goals.length * 5),
          priority: goals.length === 0 ? 'High' : 'Medium',
        },
      ])
      toast.success(`Added "${cleanTitle}"`)
    }
    setQuery('')
  }

  const handleBuildFullDayPlan = async () => {
    if (goals.length === 0) {
      toast.error('Please select or add at least one goal first.')
      return
    }
    const capLabel =
      CAPACITY_CARDS.find((c) => c.minutes === capacity)?.label || '5–6 hours / day'

    setLoadingModal({
      title: `Personalizing ${displayName}’s Experience with NVIDIA AI & Tavily`,
      subtitle: `Packing ${capLabel} around your custom routine (Work from ${morningWorkStart} & ${afternoonWorkStart})`,
      steps: [
        `Querying Tavily Search API across ${goals.length} goal curriculum(s)...`,
        `Decomposing syllabuses into 90-min modules via NVIDIA Nemotron-3.5-Lightning...`,
        `Respecting ${customRoutineBlocks.length} custom routine blocks (Badminton, Sleep, Meals)...`,
        `Allotting tasks starting at ${morningWorkStart} & ${afternoonWorkStart}...`,
      ],
      visibleStepCount: 1,
    })

    try {
      const r = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'research_and_build_plan',
          name: displayName,
          occupation,
          wakeTime: wake,
          sleepTime: sleep,
          dailyWorkMinutes: capacity,
          morningWorkStart,
          afternoonWorkStart,
          customRoutineBlocks,
          goals,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to build plan')
      setPlan(data)
      setSelectedDayIdx(0)
      setStep(6)
      toast.success(`Welcome, ${displayName}! Your personalized AI Assistant OS is ready.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not complete research')
    } finally {
      setLoadingModal(null)
    }
  }

  const updateBlockStatus = useCallback(
    (itemId: string, nextStatus: 'IN_PROGRESS' | 'DONE' | 'MISSED', dayIdx: number = selectedDayIdx) => {
      if (!plan) return
      const updatedDays = plan.fullDaySchedule.map((day, idx) => {
      if (idx !== dayIdx) return day
      const target = day.items.find((it) => it.id === itemId)
      const nextItems = day.items.map((it) => {
        if (it.id === itemId) {
          if (nextStatus === 'IN_PROGRESS') {
            setFocusSecondsLeft((it.durationMinutes || 90) * 60)
            setFocusPaused(false)
          }
          return { ...it, status: nextStatus }
        }
        return nextStatus === 'IN_PROGRESS' && it.status === 'IN_PROGRESS'
          ? { ...it, status: 'PLANNED' as const }
          : it
      })
      if (nextStatus === 'MISSED' && target) {
        nextItems.push({
          id: `${itemId}-recovered-${Date.now()}`,
          start: '21:30',
          end: '23:00',
          durationMinutes: target.durationMinutes,
          title: `Rescheduled: ${target.title}`,
          type: 'deep-work',
          goal: target.goal,
          deadline: target.deadline,
          status: 'PLANNED',
        })
        setRecoveryBanner(
          `Moved "${formatTaskTitle(target.title).headline}" into your 21:30–23:00 evening recovery window.`,
        )
      }
      return { ...day, items: nextItems }
    })
    setPlan({ ...plan, fullDaySchedule: updatedDays })
  }, [plan, selectedDayIdx])

  const displayedSuggestedGoals = useMemo(() => {
    const list =
      profile?.suggestedGoals ||
      ROLE_DEFAULT_GOALS[occupation] ||
      ROLE_DEFAULT_GOALS['University / College Student']
    if (activeCategory === 'ALL') return list
    return list.filter((g) => g.category === activeCategory)
  }, [profile, occupation, activeCategory])

  const todayGoalMinutes = activeItems
    .filter((i) => i.type === 'deep-work')
    .reduce((acc, i) => acc + (i.durationMinutes || 90), 0)
  const doneGoalMinutes = activeItems
    .filter((i) => i.type === 'deep-work' && i.status === 'DONE')
    .reduce((acc, i) => acc + (i.durationMinutes || 90), 0)
  const assistantScore =
    step < 6
      ? CAPACITY_CARDS.find((c) => c.minutes === capacity)?.score || 94
      : Math.min(99, 84 + Math.round((doneGoalMinutes / Math.max(60, todayGoalMinutes)) * 15))

  const todayGoalAllotment = useMemo(() => {
    const map = new Map<string, { minutes: number; blocks: number }>()
    for (const item of activeItems) {
      if (item.type === 'deep-work' && item.goal) {
        const prev = map.get(item.goal) || { minutes: 0, blocks: 0 }
        map.set(item.goal, {
          minutes: prev.minutes + (item.durationMinutes || 90),
          blocks: prev.blocks + 1,
        })
      }
    }
    return map
  }, [activeItems])

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden antialiased selection:bg-[#CDE06A]/30 selection:text-[#1A1A1A] ${
        studioContrastDark ? 'dark admincn bg-[#09090B] text-slate-100' : 'sundrel bg-[#EFEDE6] text-[#141414]'
      } ${perfMode ? 'perf' : ''}`}
    >
      {/* Boot splash — brand intro on every app launch */}
      <AnimatePresence>
        {!booted && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onClick={() => setBooted(true)}
            className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center bg-[#0B0B0C]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <BrandMark className="size-20 rounded-[22px] shadow-[0_0_60px_rgba(205,224,106,0.35)]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
              className="mt-5 text-3xl font-extrabold tracking-tight text-white"
            >
              talverin
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400"
            >
              Powered by NVIDIA Nemotron
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#CDE06A]"
            >
              + Tavily Search API
            </motion.span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.9, ease: 'easeInOut', delay: 0.2 }}
              className="mt-8 h-[3px] w-44 origin-left rounded-full bg-[#CDE06A]"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* AI Synthesis Modal */}
      <AnimatePresence>
        {loadingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="inner-highlight w-full max-w-lg rounded-[28px] bg-white/95 p-1.5 ring-1 ring-slate-900/10"
            >
              <div className="relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-7 text-slate-900">
                <Meteors number={14} />
                <BorderBeam
                  size={180}
                  duration={9}
                  colorFrom="#CDE06A"
                  colorTo="#141414"
                />
                <div className="relative">
                <div className="relative mx-auto mb-5 flex size-16 items-center justify-center">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.08, 0.35] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-[#11A683]"
                  />
                  <div className="animate-orb-float relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#15C39A] to-[#0E8A6D] text-slate-950">
                    <Sparkles className="size-6 stroke-[2.2]" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0E8A6D] ring-1 ring-emerald-500/20">
                    <Zap className="size-3" /> NVIDIA Nemotron + Tavily Engine
                  </span>
                  <TextEffect
                    as="h2"
                    per="word"
                    preset="fade"
                    className="mt-2.5 text-balance text-xl font-bold tracking-tight text-slate-900"
                  >
                    {loadingModal.title}
                  </TextEffect>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {loadingModal.subtitle}
                  </p>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="animate-shimmer-bar h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (loadingModal.visibleStepCount / Math.max(1, loadingModal.steps.length)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  {loadingModal.steps.map((s, idx) => {
                    const visible = idx < loadingModal.visibleStepCount
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 text-xs font-medium transition-opacity ${
                          visible ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            visible
                              ? 'bg-gradient-to-b from-[#15C39A] to-[#0E8A6D] text-slate-950 shadow-xs'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Check className="size-3 stroke-[3]" />
                        </span>
                        <span className="text-slate-700">{s}</span>
                      </div>
                    )
                  })}
                </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laptop Audio Alarm Modal */}
      <AnimatePresence>
        {alarmItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="w-full max-w-md rounded-[28px] bg-white/95 p-1.5 shadow-2xl ring-1 ring-amber-400/50"
            >
              <div className="rounded-[22px] border border-amber-100 bg-white p-7 text-center text-slate-900">
                <div className="relative mx-auto mb-3 flex size-16 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/30" />
                  <div className="animate-bell-ring relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-100 to-amber-50 text-amber-600 ring-1 ring-amber-200">
                    <Bell className="size-7" />
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 ring-1 ring-amber-500/20">
                  <Bell className="size-3" /> Task Alarm Ringing
                </span>
                <h2 className="mt-2.5 text-lg font-bold tracking-tight text-slate-900">
                  {formatTaskTitle(alarmItem.title).headline}
                </h2>
                <p className="mt-1 font-mono text-xs font-semibold text-[#0E8A6D]">
                  {alarmItem.start} – {alarmItem.end} ({alarmItem.durationMinutes} mins)
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = alarmItem.id
                      stopAlarm()
                      updateBlockStatus(id, 'IN_PROGRESS')
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] py-3 text-xs font-bold text-white shadow-[0_2px_10px_rgba(17,166,131,0.3)] hover:brightness-105"
                  >
                    <Play className="size-3.5 fill-current" /> Start Focus Session
                  </button>
                  <button
                    type="button"
                    onClick={stopAlarm}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Clock className="size-3.5" /> Snooze 5 Minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const id = alarmItem.id
                      stopAlarm()
                      updateBlockStatus(id, 'MISSED')
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    <RotateCcw className="size-3.5" /> Reschedule to Evening
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day briefing — real-time catch-up when the day is underway */}
      <AnimatePresence>
        {briefing && step >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              className="inner-highlight w-full max-w-md rounded-[28px] bg-white p-1.5 ring-1 ring-slate-900/10"
            >
              <div className="rounded-[22px] border border-slate-100 bg-white p-7 text-slate-900">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0E8A6D] ring-1 ring-emerald-500/20">
                  <AlarmClock className="size-3" /> Day briefing
                </span>
                <h2 className="mt-2.5 text-balance text-xl font-bold tracking-tight">
                  {Math.round(briefing.pct * 100)}% of your day has passed, {displayName}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {briefing.remainingCount} session{briefing.remainingCount === 1 ? '' : 's'} ·{' '}
                  {briefing.remainingMinutes} minutes still ahead
                  {briefing.nextStart ? ` — next up “${briefing.nextTitle}” at ${briefing.nextStart}` : ''}.
                  I can re-fit everything into your remaining open windows.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.localStorage.setItem(`talverin:briefed:${briefing.date}`, '1')
                      } catch {
                        /* ignore */
                      }
                      setBriefing(null)
                      repackRemainingToday()
                    }}
                    className="btn-shine inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] py-3 text-xs font-bold text-white shadow-[0_4px_14px_rgba(17,166,131,0.3)] hover:brightness-105"
                  >
                    <Zap className="size-3.5" /> Re-fit remaining day
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.localStorage.setItem(`talverin:briefed:${briefing.date}`, '1')
                      } catch {
                        /* ignore */
                      }
                      setBriefing(null)
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Keep plan as-is
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          PROGRESSIVE ONE-QUESTION-AT-A-TIME ONBOARDING STUDIO (step 1..5)
          Double-Bezel Glassmorphic Framing + Ambient Aurora Mesh
         ===================================================================== */}
      {step < 6 ? (
        <div
          data-testid="onboarding-scroll"
          className={`relative flex h-full w-full flex-col overflow-y-auto transition-colors duration-300 ${
            studioContrastDark ? 'bg-[#091412]' : 'bg-[#F4F7F6]'
          }`}
        >
          {/* Ambient 3D Geometry + Aurora Mesh & Architectural Dot Grid */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
            {!perfMode && <GeometryBackdrop dark={studioContrastDark} density={1} />}
            <div className="animate-aurora-drift absolute -top-32 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#15C39A]/20 via-teal-400/10 to-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-24 h-[320px] w-[420px] rounded-full bg-indigo-500/[0.07] blur-3xl" />
            <div className="absolute -bottom-32 -right-24 h-[300px] w-[400px] rounded-full bg-[#15C39A]/[0.07] blur-3xl" />
            {/* Floating geometric accents */}
            <div className="geo-float absolute left-[8%] top-[18%] hidden size-10 rotate-45 rounded-lg border-2 border-[#11A683]/25 lg:block" />
            <div className="geo-float-delayed absolute bottom-[16%] right-[7%] hidden size-14 rounded-full border-2 border-indigo-400/25 lg:block" />
            <div className="geo-float absolute right-[14%] top-[12%] hidden text-2xl font-light text-[#11A683]/30 lg:block">
              +
            </div>
            <div
              className="absolute inset-0 opacity-[0.28]"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          </div>

          <header className="glass-panel sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-900/[0.06] px-4 backdrop-blur-xl sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandMark className="size-9 shrink-0 rounded-xl shadow-[0_2px_10px_rgba(20,20,20,0.25)]" />
              <span className="text-base font-extrabold tracking-tight text-slate-900">talverin</span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums text-[#0E8A6D] ring-1 ring-emerald-500/20 sm:inline-block">
                STEP 0{step} / 05 • {Math.round((step / 5) * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((qNum) => {
                const isCurr = step === qNum
                const isDone = step > qNum
                return (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => {
                      if (qNum <= step || name.trim()) {
                        setStep(qNum as 1 | 2 | 3 | 4 | 5)
                      }
                    }}
                    title={`Question ${qNum}`}
                    className="group relative flex cursor-pointer items-center py-1"
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className={`block h-1.5 rounded-full transition-colors ${
                        isCurr
                          ? 'w-8 bg-gradient-to-r from-[#0E8A6D] to-[#15C39A]'
                          : isDone
                            ? 'w-2.5 bg-[#15C39A]'
                            : 'w-2 bg-slate-300/80 group-hover:bg-slate-400'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <Skiper26ThemeToggle
                isDark={studioContrastDark}
                onToggle={() => setStudioContrastDark((d) => !d)}
                className="size-8 p-1.5"
              />
              {plan && (
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0B1917] px-3.5 py-1.5 text-xs font-semibold text-[#15C39A] shadow-xs ring-1 ring-white/10"
                >
                  Open Workspace <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </header>

          <div className="relative z-10 m-auto w-full max-w-2xl shrink-0 px-4 py-8 sm:px-6 sm:py-10">
            <Spotlight
              size={300}
              className="from-emerald-200/70 via-teal-100/50 to-transparent"
            />
            <AnimatePresence mode="wait">
              {/* QUESTION 1: ONLY "What should we call you?" */}
              {step === 1 && (
                <motion.div
                  key="question-1-name-only"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="inner-highlight relative mx-auto w-full max-w-lg rounded-[28px] bg-white/80 p-1.5 ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                >
                  <BorderTrail
                    size={90}
                    className="bg-gradient-to-l from-[#15C39A] via-[#15C39A]/50 to-transparent"
                  />
                  <div className="rounded-[22px] border border-white/80 bg-white p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-11">
                    <MediaArt
                      variant="hero"
                      alt="Talverin orbit artwork"
                      className="media-banner mb-6 h-36 rounded-2xl ring-1 ring-slate-900/[0.06] sm:h-44"
                    />
                    <SkiperBracketBadge>Question 01 of 05</SkiperBracketBadge>

                    <SkiperPerspectiveHeading
                      text="What should we call you?"
                      className="mt-3.5 text-balance text-2xl sm:text-3xl"
                    />
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Your assistant greets you, labels plans, and tunes motivation around your
                      name.
                    </p>

                    <div className="mt-7">
                      <div className="relative">
                        <input
                          ref={nameInputRef}
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleQuestion1Next()
                            }
                          }}
                          placeholder="Type your first name..."
                          aria-label="What should we call you?"
                          autoComplete="given-name"
                          maxLength={30}
                          className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/60 px-4 py-3.5 pr-24 text-lg font-bold tracking-tight text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-all placeholder:font-normal placeholder:text-slate-400 focus:border-[#11A683] focus:bg-white focus:ring-4 focus:ring-[#15C39A]/15 focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2 py-1 font-mono text-[10px] font-medium text-slate-400 shadow-2xs sm:inline-flex">
                          Enter <CornerDownLeft className="size-2.5" />
                        </span>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-center text-[11px] text-slate-400 sm:text-left">
                        Takes 5 seconds • You can change it later
                      </span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleQuestion1Next}
                        className="btn-shine relative inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(17,166,131,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:brightness-105 sm:w-auto"
                      >
                        <GlowEffect
                          colors={['#15C39A', '#818cf8', '#15C39A']}
                          mode="pulse"
                          blur="soft"
                        />
                        <span className="relative z-10 inline-flex items-center gap-2">
                          Continue <ArrowRight className="size-4" />
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUESTION 2: PRIMARY ROLE */}
              {step === 2 && (
                <motion.div
                  key="question-2-occupation"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="rounded-[28px] bg-white/75 p-1.5 shadow-[0_20px_50px_-12px_rgba(15,31,28,0.1)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                >
                  <div className="rounded-[22px] border border-white/80 bg-white p-7 sm:p-9">
                    <SkiperBracketBadge>Question 02 of 05</SkiperBracketBadge>
                    <SkiperPerspectiveHeading
                      text={`Nice to meet you, ${displayName}. What best describes your role?`}
                      className="mt-2.5"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Used by NVIDIA Nemotron to tailor your goal suggestions and daily workflow.
                    </p>

                    <motion.div
                      variants={springStaggerContainer}
                      initial="hidden"
                      animate="show"
                      className="mt-6 grid gap-3 sm:grid-cols-2"
                    >
                      {OCCUPATION_CARDS.map((item) => {
                        const Icon = item.icon
                        const isSelected = occupation === item.title
                        return (
                          <FramerTiltCard
                            key={item.id}
                            isSelected={isSelected}
                            onClick={() => setOccupation(item.title)}
                            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#11A683] bg-gradient-to-br from-[#0B1917] to-[#122924] text-white shadow-[0_10px_25px_-5px_rgba(15,31,28,0.25)]'
                                : 'border-slate-200/80 bg-white text-slate-900 shadow-2xs hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  className={`flex size-9 items-center justify-center rounded-xl border ${
                                    isSelected
                                      ? 'border-emerald-400/30 bg-[#CDE06A] text-slate-950 shadow-xs'
                                      : item.iconBg
                                  }`}
                                >
                                  <Icon className="size-4" />
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                                    isSelected
                                      ? 'bg-[#CDE06A] text-slate-950'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                  {isSelected ? 'Selected' : item.tag}
                                </span>
                              </div>
                              <h3
                                className={`mt-3 text-sm font-bold ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {item.title}
                              </h3>
                              <p
                                className={`mt-1 text-xs leading-relaxed ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {item.subtitle}
                              </p>
                            </div>
                          </FramerTiltCard>
                        )
                      })}
                    </motion.div>

                    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ChevronLeft className="size-4" /> Back
                      </button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => void handleQuestion2Next()}
                        className="inline-flex btn-shine cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(17,166,131,0.25)] hover:brightness-105"
                      >
                        Continue <ArrowRight className="size-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUESTION 3: DAILY CAPACITY, ROUTINE & WORK WINDOWS */}
              {step === 3 && (
                <motion.div
                  key="question-3-capacity-and-routine"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="rounded-[28px] bg-white/75 p-1.5 shadow-[0_20px_50px_-12px_rgba(15,31,28,0.1)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                >
                  <div className="rounded-[22px] border border-white/80 bg-white p-7 sm:p-9">
                    <SkiperBracketBadge>Question 03 of 05</SkiperBracketBadge>
                    <SkiperPerspectiveHeading
                      text="Set your daily capacity & routine blocks"
                      className="mt-2.5"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      AI schedules tasks strictly inside your open work windows (e.g., 11:00 and
                      16:00) and never overlaps with your sports or sleep blocks.
                    </p>
                    <MediaArt
                      variant="rhythm"
                      alt="Daily rhythm timeline artwork"
                      className="media-banner mt-4 h-28 rounded-2xl bg-emerald-50/50 ring-1 ring-slate-900/[0.05] sm:h-32"
                    />

                    <motion.div
                      variants={springStaggerContainer}
                      initial="hidden"
                      animate="show"
                      className="mt-5 grid gap-3 sm:grid-cols-2"
                    >
                      {CAPACITY_CARDS.map((c) => {
                        const isSelected = capacity === c.minutes
                        return (
                          <FramerTiltCard
                            key={c.minutes}
                            isSelected={isSelected}
                            onClick={() => setCapacity(c.minutes)}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#11A683] bg-gradient-to-br from-[#0B1917] to-[#122924] text-white shadow-[0_10px_25px_-5px_rgba(15,31,28,0.25)]'
                                : 'border-slate-200/80 bg-white text-slate-900 shadow-2xs hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  isSelected
                                    ? 'bg-[#CDE06A] text-slate-950'
                                    : 'bg-emerald-50 text-[#0E8A6D]'
                                }`}
                              >
                                {c.badge}
                              </span>
                              <span
                                className={`font-mono text-[11px] font-medium ${
                                  isSelected ? 'text-emerald-300' : 'text-slate-400'
                                }`}
                              >
                                {c.blocks}
                              </span>
                            </div>
                            <div className="mt-2.5 flex items-baseline gap-2">
                              <span
                                className={`font-mono text-xl font-bold ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {c.hoursText}
                              </span>
                              <span
                                className={`text-xs ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                ({c.label})
                              </span>
                            </div>
                          </FramerTiltCard>
                        )
                      })}
                    </motion.div>

                    <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 sm:grid-cols-4">
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600">
                        Wake-Up
                        <input
                          type="time"
                          value={wake}
                          onChange={(e) => setWake(e.target.value)}
                          className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-[#0E8A6D]">
                        Start Morning Work
                        <input
                          type="time"
                          value={morningWorkStart}
                          onChange={(e) => setMorningWorkStart(e.target.value)}
                          className="rounded-lg border border-[#11A683]/60 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-[#0E8A6D]">
                        Afternoon Work
                        <input
                          type="time"
                          value={afternoonWorkStart}
                          onChange={(e) => setAfternoonWorkStart(e.target.value)}
                          className="rounded-lg border border-[#11A683]/60 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-600">
                        Bedtime
                        <input
                          type="time"
                          value={sleep}
                          onChange={(e) => setSleep(e.target.value)}
                          className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                        />
                      </label>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4">
                      <span className="text-xs font-bold text-slate-800">
                        Daily Routine & Blocked Hours (Badminton, Sleep, Meals)
                      </span>
                      <div className="mt-2.5 flex flex-col gap-2">
                        {customRoutineBlocks.map((rb) => (
                          <div
                            key={rb.id}
                            className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 sm:flex-nowrap"
                          >
                            <input
                              type="time"
                              value={rb.start}
                              onChange={(e) =>
                                updateRoutineBlockField(rb.id, 'start', e.target.value)
                              }
                              className="w-24 rounded-md border border-slate-200/80 bg-white px-2 py-1 font-mono text-xs font-semibold text-slate-800"
                            />
                            <span className="text-xs text-slate-400">–</span>
                            <input
                              type="time"
                              value={rb.end}
                              onChange={(e) => updateRoutineBlockField(rb.id, 'end', e.target.value)}
                              className="w-24 rounded-md border border-slate-200/80 bg-white px-2 py-1 font-mono text-xs font-semibold text-slate-800"
                            />
                            <input
                              type="text"
                              value={rb.title}
                              onChange={(e) =>
                                updateRoutineBlockField(rb.id, 'title', e.target.value)
                              }
                              className="min-w-[140px] flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-xs font-medium text-slate-800 focus:border-slate-200 focus:bg-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeRoutineBlock(rb.id)}
                              className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-1 sm:flex-nowrap">
                        <input
                          type="time"
                          value={newRoutineStart}
                          onChange={(e) => setNewRoutineStart(e.target.value)}
                          className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1.5 font-mono text-xs font-semibold text-slate-800"
                        />
                        <span className="text-xs text-slate-400">–</span>
                        <input
                          type="time"
                          value={newRoutineEnd}
                          onChange={(e) => setNewRoutineEnd(e.target.value)}
                          className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1.5 font-mono text-xs font-semibold text-slate-800"
                        />
                        <input
                          type="text"
                          value={newRoutineTitle}
                          onChange={(e) => setNewRoutineTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCustomRoutineBlock()
                            }
                          }}
                          placeholder="Add routine block (e.g., Gym, Class)..."
                          className="min-w-[140px] flex-1 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={addCustomRoutineBlock}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#0B1917] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          <Plus className="size-3.5" /> Add
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ChevronLeft className="size-4" /> Back
                      </button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(4)}
                        className="inline-flex btn-shine cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(17,166,131,0.25)] hover:brightness-105"
                      >
                        Continue <ArrowRight className="size-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUESTION 4: GOAL SELECTION */}
              {step === 4 && (
                <motion.div
                  key="question-4-goals"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="rounded-[28px] bg-white/75 p-1.5 shadow-[0_20px_50px_-12px_rgba(15,31,28,0.1)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                >
                  <div className="rounded-[22px] border border-white/80 bg-white p-7 sm:p-9">
                    <SkiperBracketBadge>Question 04 of 05</SkiperBracketBadge>
                    <SkiperPerspectiveHeading
                      text={`Which goals should we schedule, ${displayName}?`}
                      className="mt-2.5"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {profile?.greeting ||
                        `Select from your ${occupation} catalog or type any custom goal below.`}
                    </p>
                    <MediaArt
                      variant="goals"
                      alt="Goals constellation artwork"
                      className="media-banner mt-4 h-28 rounded-2xl bg-indigo-50/40 ring-1 ring-slate-900/[0.05] sm:h-32"
                    />

                    <div className="mt-5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-400" />
                          <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && query.trim()) {
                                e.preventDefault()
                                toggleGoal({ title: query })
                              }
                            }}
                            placeholder="Search or type any custom goal..."
                            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:border-[#11A683] focus:bg-white focus:ring-4 focus:ring-[#15C39A]/15 focus:outline-none"
                          />
                        </div>
                        {query.trim() && (
                          <button
                            type="button"
                            onClick={() => toggleGoal({ title: query })}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-4 py-2.5 text-xs font-bold text-white"
                          >
                            <Plus className="size-3.5" /> Add
                          </button>
                        )}
                      </div>

                      {query.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg"
                        >
                          <button
                            type="button"
                            onClick={() => toggleGoal({ title: query })}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 border-b border-slate-100 bg-emerald-50/60 px-4 py-3 text-left hover:bg-emerald-50"
                          >
                            <span className="text-xs font-bold text-emerald-950">
                              + Add Custom Goal: “{query.trim()}”
                            </span>
                            <span className="rounded-full bg-[#11A683] px-2.5 py-0.5 text-[10px] font-bold text-white">
                              Select
                            </span>
                          </button>
                          <div className="divide-y divide-slate-100">
                            {suggestions.map((sug, i) => (
                              <button
                                key={`${sug.title}-${i}`}
                                type="button"
                                onClick={() => toggleGoal(sug)}
                                className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-slate-50"
                              >
                                <div className="min-w-0">
                                  <span className="block truncate text-xs font-bold text-slate-900">
                                    {sug.title}
                                  </span>
                                  <span className="block truncate text-[11px] text-slate-500">
                                    {sug.description}
                                  </span>
                                </div>
                                <span className="shrink-0 font-mono text-[11px] font-semibold text-[#0E8A6D]">
                                  +{sug.estimatedHours || 12}h
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <motion.div
                      variants={springStaggerContainer}
                      initial="hidden"
                      animate="show"
                      className="mt-5 grid gap-2.5 sm:grid-cols-2"
                    >
                      {displayedSuggestedGoals.map((item, idx) => {
                        const isSelected = goals.some(
                          (g) => g.title.toLowerCase() === item.title.toLowerCase(),
                        )
                        return (
                          <FramerTiltCard
                            key={`${item.title}-${idx}`}
                            isSelected={isSelected}
                            onClick={() => toggleGoal(item)}
                            className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                              isSelected
                                ? 'border-[#11A683] bg-gradient-to-br from-[#0B1917] to-[#122924] text-white shadow-[0_10px_25px_-5px_rgba(15,31,28,0.22)]'
                                : 'border-slate-200/80 bg-white text-slate-900 shadow-2xs hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                    isSelected
                                      ? 'bg-white/15 text-emerald-300'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {item.category}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
                                    isSelected ? 'text-[#15C39A]' : 'text-slate-400'
                                  }`}
                                >
                                  {isSelected && <Check className="size-3 stroke-[3]" />}
                                  {isSelected ? 'Selected' : `${item.estimatedHours || 12}h`}
                                </span>
                              </div>
                              <h3
                                className={`mt-2 text-xs font-bold ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {item.title}
                              </h3>
                              <p
                                className={`mt-1 line-clamp-2 text-[11px] ${
                                  isSelected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {item.description}
                              </p>
                            </div>
                          </FramerTiltCard>
                        )
                      })}
                    </motion.div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ChevronLeft className="size-4" /> Back
                      </button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep(5)}
                        disabled={goals.length === 0}
                        className="inline-flex btn-shine cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-6 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(17,166,131,0.25)] hover:brightness-105 disabled:opacity-50"
                      >
                        Continue ({goals.length}) <ArrowRight className="size-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUESTION 5: TARGET DEADLINES */}
              {step === 5 && (
                <motion.div
                  key="question-5-deadlines"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="rounded-[28px] bg-white/75 p-1.5 shadow-[0_20px_50px_-12px_rgba(15,31,28,0.1)] ring-1 ring-slate-900/[0.06] backdrop-blur-xl"
                >
                  <div className="rounded-[22px] border border-white/80 bg-white p-7 sm:p-9">
                    <SkiperBracketBadge>Question 05 of 05</SkiperBracketBadge>
                    <SkiperPerspectiveHeading
                      text="Set target dates & priorities"
                      className="mt-2.5"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Tavily researches each syllabus and NVIDIA Nemotron weights your daily
                      sessions around {morningWorkStart} & {afternoonWorkStart}.
                    </p>

                    <div className="mt-5 flex flex-col gap-3">
                      <AnimatePresence mode="popLayout">
                        {goals.map((g, idx) => {
                          const daysRem = daysUntilYmd(g.date)
                          return (
                            <motion.div
                              key={g.id}
                              layout
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-bold text-slate-900">
                                    {g.title}
                                  </h3>
                                  <span className="text-[11px] text-slate-500">
                                    {g.category} • {daysRem} days remaining
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setGoals(goals.filter((_, i) => i !== idx))}
                                  className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>

                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600">
                                    Target Date
                                  </label>
                                  <input
                                    type="date"
                                    value={g.date}
                                    min={new Date().toISOString().slice(0, 10)}
                                    onChange={(e) =>
                                      setGoals(
                                        goals.map((item, i) =>
                                          i === idx ? { ...item, date: e.target.value } : item,
                                        ),
                                      )
                                    }
                                    className="mt-1 w-full rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600">
                                    Priority
                                  </label>
                                  <div className="mt-1 grid grid-cols-3 gap-1">
                                    {(['High', 'Medium', 'Normal'] as const).map((p) => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() =>
                                          setGoals(
                                            goals.map((item, i) =>
                                              i === idx ? { ...item, priority: p } : item,
                                            ),
                                          )
                                        }
                                        className={`cursor-pointer rounded-lg border py-1.5 text-xs font-semibold transition-all ${
                                          g.priority === p
                                            ? 'border-[#11A683] bg-[#0B1917] text-white shadow-2xs'
                                            : 'border-slate-200/80 bg-white text-slate-700'
                                        }`}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ChevronLeft className="size-4" /> Back
                      </button>
                      <ShimmerButton
                        onClick={() => void handleBuildFullDayPlan()}
                        borderRadius="14px"
                        shimmerColor="#e8e6da"
                        background="radial-gradient(ellipse 80% 50% at 50% 120%,rgba(60,60,55,0.55),rgba(20,20,18,0.65)), #101010"
                        className="text-xs font-bold"
                      >
                        <Sparkles className="size-4" /> Build Personalized Schedule
                      </ShimmerButton>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* =====================================================================
           STEP 6: HIGH-CRAFT 3-PANE DESKTOP STUDIO OS
           (Obsidian-Emerald Dock + Architectural Timeline + Frosted Inspector)
           ===================================================================== */
        <>
          {/* PANE 1 (LEFT): Obsidian-Emerald Navigation Dock (228px) */}
          <aside
            className="relative hidden w-[228px] shrink-0 flex-col justify-between overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#101010] via-[#0C0C0B] to-[#080807] p-4 text-white md:flex"
          >
            {/* Subtle Ambient Top Glow */}
            <div className="pointer-events-none absolute -left-10 -top-10 size-44 rounded-full bg-[#15C39A]/12 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5">
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 px-1.5 pt-1">
                <BrandMark className="size-9 shrink-0 rounded-xl shadow-[0_0_20px_rgba(205,224,106,0.3)]" />
                <div>
                  <span className="block text-base font-extrabold tracking-tight text-white">
                    talverin
                  </span>
                  <span className="block text-[10px] font-medium text-emerald-300/75">
                    Personal AI Studio
                  </span>
                </div>
              </div>

              {/* Tactile Metallic Emerald Primary CTA */}
              <Magnetic intensity={0.35} range={120}>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#18D2A6] to-[#11A683] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_2px_12px_rgba(21,195,154,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] transition-all hover:brightness-105"
                >
                  <Plus className="size-3.5 stroke-[2.5]" /> Add / Edit Goals
                </button>
              </Magnetic>

              {/* Workspace Views */}
              <nav className="flex flex-col gap-1">
                <span className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400/80">
                  Workspace
                </span>
                {[
                  { id: 'plan', label: 'Daily Schedule', icon: LayoutDashboard },
                  { id: 'analysis', label: 'Syllabus & Modules', icon: BookOpen },
                  { id: 'roadmap', label: '7-Day Roadmap', icon: Layers },
                  { id: 'reports', label: 'Day Reports', icon: FileText },
                  { id: 'chat', label: 'AI Chat', icon: MessageCircleHeart },
                  { id: 'settings', label: 'AI & UI Studio', icon: Settings },
                ].map((v) => {
                  const Icon = v.icon
                  const active = tab === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        setTab(v.id as 'plan' | 'analysis' | 'roadmap' | 'reports' | 'settings')
                      }
                      className={`relative flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                        active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-nav-active-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                          className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/10"
                        />
                      )}
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-[#CDE06A] shadow-[0_0_8px_#CDE06A]" />
                      )}
                      <Icon
                        className={`relative z-10 size-4 ${
                          active ? 'text-[#CDE06A]' : 'text-slate-400'
                        }`}
                      />
                      <span className="relative z-10">{v.label}</span>
                    </button>
                  )
                })}

                <span className="mb-1 mt-5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400/80">
                  Calibration
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoutineCustomizer((v) => !v)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <Clock className="size-4 text-[#15C39A]" />
                  <span>Routine & Work Hours</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <SlidersHorizontal className="size-4 text-[#15C39A]" />
                  <span>Onboarding Answers</span>
                </button>
              </nav>
            </div>

            {/* Bottom Profile & Alarm Test */}
            <div className="relative z-10 flex flex-col gap-2.5 border-t border-white/[0.08] pt-3.5">
              <button
                type="button"
                onClick={() =>
                  triggerAlarm(
                    activeItems.find((i) => i.type === 'deep-work') || {
                      id: 'test-alarm',
                      start: morningWorkStart,
                      end: '12:30',
                      durationMinutes: 90,
                      title: goals[0]?.title || 'Scheduled Deep-Work Session',
                      type: 'deep-work',
                      goal: goals[0]?.title,
                      status: 'PLANNED',
                    },
                  )
                }
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-amber-300/90 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]"
              >
                <Volume2 className="size-3.5" /> Test Task Alarm
              </button>

              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/[0.07]">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#15C39A] to-[#0E8A6D] text-xs font-bold text-slate-950">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-xs font-semibold text-white">
                    {displayName}
                  </strong>
                  <span className="block truncate text-[10px] text-slate-400">{occupation}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* PANE 2 (CENTER): Atmospheric Studio Canvas */}
          <main
            className={`relative flex flex-1 flex-col overflow-y-auto transition-colors duration-300 ${
              studioContrastDark ? 'bg-[#09090B]' : 'bg-[#F4F7F6]'
            }`}
          >
            {/* Subtle Ambient Top Radial Glow + 3D Geometry Depth */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              {!perfMode && (
                <GeometryBackdrop dark={studioContrastDark} density={0.55} interactive={false} />
              )}
              <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(17,166,131,0.08),transparent_75%)]" />
            </div>

            {/* Single-Line Frosted Glass Header (h-14) */}
            <header className="glass-panel sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-900/[0.06] px-4 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="font-display truncate text-sm font-bold tracking-tight text-slate-900">
                  {tab === 'plan' && `${displayName}’s Daily Schedule`}
                  {tab === 'analysis' && 'Tavily Syllabus & Modules'}
                  {tab === 'roadmap' && '7-Day Goal Roadmap'}
                  {tab === 'reports' && 'Day Reports & Summaries'}
                  {tab === 'settings' && 'AI & Skiper UI Studio'}
                </h1>
                <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#0E8A6D] ring-1 ring-emerald-500/20 md:inline-flex">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#11A683] opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-[#11A683]" />
                  </span>
                  {(todayGoalMinutes / 60).toFixed(1)}h Deep Work • {morningWorkStart} &{' '}
                  {afternoonWorkStart}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoutineCustomizer((v) => !v)}
                  aria-expanded={showRoutineCustomizer}
                  className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    showRoutineCustomizer
                      ? 'bg-[#0B1917] text-[#15C39A] shadow-xs ring-1 ring-slate-900'
                      : 'bg-white text-slate-700 shadow-2xs ring-1 ring-slate-900/[0.08] hover:bg-slate-50'
                  }`}
                >
                  <Clock className="size-3.5 text-[#11A683]" />
                  <span className="hidden sm:inline">Customize Routine</span>
                  <span className="sm:hidden">Routine</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddScheduleSlot((v) => !v)}
                  aria-expanded={showAddScheduleSlot}
                  className="btn-shine inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(14,138,109,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] hover:brightness-105"
                >
                  <Plus className="size-3.5" />
                  <span className="hidden sm:inline">Add Slot</span>
                </button>

                <Skiper26ThemeToggle
                  isDark={studioContrastDark}
                  onToggle={() => setStudioContrastDark((d) => !d)}
                  className="size-9 p-1.5"
                />

                <button
                  type="button"
                  onClick={() => setShowSkiperController((v) => !v)}
                  title="Toggle UI Scale Controller"
                  aria-label="Toggle UI scale controller"
                  className={`hidden h-9 cursor-pointer items-center gap-1 rounded-xl p-1.5 text-xs font-semibold transition-all sm:inline-flex ${
                    showSkiperController
                      ? 'bg-[#0B1917] text-[#15C39A] ring-1 ring-slate-900'
                      : 'bg-white text-slate-600 shadow-2xs ring-1 ring-slate-900/[0.08] hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setPerfMode((v) => !v)}
                  title={perfMode ? 'Performance mode on — full visuals off' : 'Performance mode off — full visuals on'}
                  aria-label="Toggle performance mode"
                  aria-pressed={perfMode}
                  className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl p-1.5 text-xs font-semibold transition-all ${
                    perfMode
                      ? 'bg-[#0B1917] text-[#15C39A] ring-1 ring-slate-900'
                      : 'bg-white text-slate-600 shadow-2xs ring-1 ring-slate-900/[0.08] hover:bg-slate-50'
                  }`}
                >
                  <Gauge className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    persistSession()
                    window.location.reload()
                  }}
                  title="Save workspace and reload"
                  aria-label="Reload workspace"
                  className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-white p-1.5 text-xs font-semibold text-slate-600 shadow-2xs ring-1 ring-slate-900/[0.08] transition-all hover:bg-slate-50"
                >
                  <RotateCcw className="size-3.5" />
                </button>

                <span className="hidden h-9 items-center rounded-xl bg-slate-900/[0.04] px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-slate-600 ring-1 ring-slate-900/[0.05] lg:inline-flex">
                  {clockStr || 'Live'}
                </span>
              </div>
            </header>

            {/* Draggable Skiper 4 Controller */}
            <AnimatePresence>
              {showSkiperController && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="fixed right-6 top-16 z-30"
                >
                  <SkiperOptionsController
                    scale={skiperScale}
                    setScale={setSkiperScale}
                    gap={skiperGap}
                    setGap={setSkiperGap}
                    setFlexDirection={setSkiperFlexDir}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="relative z-10 mx-auto w-full max-w-4xl flex-none px-6 py-6 transition-transform duration-300 sm:px-8"
              style={{
                transform: skiperScale ? `scale(${0.92 + (skiperScale / 100) * 0.16})` : undefined,
                transformOrigin: 'top center',
              }}
            >
              <Spotlight
                size={340}
                className="from-emerald-200/50 via-teal-100/30 to-transparent"
              />
              {/* Slide-Down Routine & Work Window Drawer */}
              <AnimatePresence>
                {showRoutineCustomizer && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 rounded-2xl bg-white p-5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Daily Routine, Sports, Sleep & Work Windows
                        </h3>
                        <p className="text-xs text-slate-500">
                          Edit your blocked routine hours or work start times below, then click{' '}
                          <strong>Re-Fit AI Schedule</strong>.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            repackScheduleAroundRoutine(
                              customRoutineBlocks,
                              morningWorkStart,
                              afternoonWorkStart,
                              plan,
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105"
                        >
                          <Sparkles className="size-3.5" /> Re-Fit AI Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRoutineCustomizer(false)}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={routineNaturalText}
                        onChange={(e) => setRoutineNaturalText(e.target.value)}
                        placeholder="Describe your day (e.g., Badminton 7am-10am, work 11am, sleep 1pm-2:30pm, work 4pm)..."
                        className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-800 focus:border-[#11A683] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleParseNaturalRoutine()}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0B1917] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <Zap className="size-3.5 text-[#15C39A]" /> Parse & Apply
                      </button>
                    </div>

                    <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 px-3.5 py-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Morning Work Starts At
                        </span>
                        <input
                          type="time"
                          value={morningWorkStart}
                          onChange={(e) => {
                            setMorningWorkStart(e.target.value)
                            repackScheduleAroundRoutine(
                              customRoutineBlocks,
                              e.target.value,
                              afternoonWorkStart,
                              plan,
                            )
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 px-3.5 py-2">
                        <span className="text-xs font-semibold text-slate-700">
                          Afternoon Work Resumes At
                        </span>
                        <input
                          type="time"
                          value={afternoonWorkStart}
                          onChange={(e) => {
                            setAfternoonWorkStart(e.target.value)
                            repackScheduleAroundRoutine(
                              customRoutineBlocks,
                              morningWorkStart,
                              e.target.value,
                              plan,
                            )
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
                      {customRoutineBlocks.map((rb) => (
                        <div
                          key={rb.id}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-2.5 py-1.5"
                        >
                          <input
                            type="time"
                            value={rb.start}
                            onChange={(e) =>
                              updateRoutineBlockField(rb.id, 'start', e.target.value)
                            }
                            className="w-20 rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800"
                          />
                          <span className="text-[10px] text-slate-400">–</span>
                          <input
                            type="time"
                            value={rb.end}
                            onChange={(e) => updateRoutineBlockField(rb.id, 'end', e.target.value)}
                            className="w-20 rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800"
                          />
                          <input
                            type="text"
                            value={rb.title}
                            onChange={(e) =>
                              updateRoutineBlockField(rb.id, 'title', e.target.value)
                            }
                            className="min-w-0 flex-1 truncate rounded px-1.5 py-0.5 text-xs font-medium text-slate-800 focus:bg-slate-50 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeRoutineBlock(rb.id)}
                            className="cursor-pointer rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 sm:flex-nowrap">
                      <input
                        type="time"
                        value={newRoutineStart}
                        onChange={(e) => setNewRoutineStart(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1.5 font-mono text-xs font-semibold text-slate-800"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="time"
                        value={newRoutineEnd}
                        onChange={(e) => setNewRoutineEnd(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1.5 font-mono text-xs font-semibold text-slate-800"
                      />
                      <input
                        type="text"
                        value={newRoutineTitle}
                        onChange={(e) => setNewRoutineTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomRoutineBlock()
                          }
                        }}
                        placeholder="Add blocked activity (e.g., Badminton, Sleep, Gym)..."
                        className="min-w-[160px] flex-1 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addCustomRoutineBlock}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#0B1917] px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <Plus className="size-3.5" /> Add Slot
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Insert Custom Activity Drawer */}
              <AnimatePresence>
                {showAddScheduleSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-6 rounded-2xl bg-white p-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Insert Activity or Task Into Schedule
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCustomSlotType('routine')}
                          className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                            customSlotType === 'routine'
                              ? 'bg-[#0B1917] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Routine / Sport / Sleep
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomSlotType('deep-work')}
                          className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                            customSlotType === 'deep-work'
                              ? 'bg-[#11A683] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Goal Deep-Work
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddScheduleSlot(false)}
                          className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <input
                        type="time"
                        value={customSlotStart}
                        aria-label="Slot start time"
                        onChange={(e) => setCustomSlotStart(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="time"
                        value={customSlotEnd}
                        aria-label="Slot end time"
                        onChange={(e) => setCustomSlotEnd(e.target.value)}
                        className="w-24 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900"
                      />
                      <input
                        type="text"
                        value={customSlotTitle}
                        aria-label="Slot title"
                        onChange={(e) => setCustomSlotTitle(e.target.value)}
                        placeholder="e.g., Play Badminton (07:00-10:00), Afternoon Sleep (13:00-14:30)..."
                        className="min-w-[180px] flex-1 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSlotToSchedule}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3.5 py-1.5 text-xs font-bold text-white"
                      >
                        <Check className="size-3.5 stroke-[3]" /> Insert
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {recoveryBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center justify-between gap-4 rounded-xl bg-amber-50/90 px-4 py-3 text-xs font-medium text-amber-900 ring-1 ring-amber-300/60"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0 text-amber-600" />
                    <span>{recoveryBanner}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecoveryBanner(null)}
                    className="cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}

              {/* ===============================================================
                  TAB 1: ARCHITECTURAL TIMELINE SCHEDULE
                  (Same uncluttered 3-column layout, elevated with high-craft surfaces)
                 =============================================================== */}
              {tab === 'plan' && (
                <div className="flex flex-col gap-4">
                  <AdminCNStats
                    weekMinutes={(plan?.fullDaySchedule || []).slice(0, 7).map((d) => d.totalGoalMinutes)}
                    selectedDayIdx={selectedDayIdx}
                    todayGoalMinutes={todayGoalMinutes}
                    doneGoalMinutes={doneGoalMinutes}
                    sessionsDone={
                      activeItems.filter((i) => i.type === 'deep-work' && i.status === 'DONE').length
                    }
                    sessionsTotal={activeItems.filter((i) => i.type === 'deep-work').length}
                    goals={goals.map((g, idx) => ({
                      title: g.title,
                      minutes: todayGoalAllotment.get(g.title)?.minutes || 0,
                      daysLeft: daysUntilYmd(g.date),
                      bar: GOAL_PALETTES[idx % GOAL_PALETTES.length].bar,
                    }))}
                    readiness={assistantScore}
                    capacityLabel={`${(capacity / 60).toFixed(1)}h/day focus`}
                    routineCount={customRoutineBlocks.length}
                    weekSessions={(plan?.fullDaySchedule || [])
                      .slice(0, 7)
                      .map((d) => d.items.filter((i) => i.type === 'deep-work').length)}
                  />
                  <div className="grid gap-4 xl:grid-cols-3">
                    <WeeklyFocusChart
                      minutes={(plan?.fullDaySchedule || []).slice(0, 7).map((d) => d.totalGoalMinutes)}
                      labels={(plan?.fullDaySchedule || [])
                        .slice(0, 7)
                        .map((d, idx) =>
                          idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.date.slice(5),
                        )}
                      highlight={selectedDayIdx}
                      className="xl:col-span-2"
                    />
                    <CompletionReport
                      doneMinutes={doneGoalMinutes}
                      remainingMinutes={Math.max(0, todayGoalMinutes - doneGoalMinutes)}
                      sessionsDone={
                        activeItems.filter((i) => i.type === 'deep-work' && i.status === 'DONE').length
                      }
                      sessionsTotal={activeItems.filter((i) => i.type === 'deep-work').length}
                      weekPct={Math.min(
                        100,
                        Math.round(
                          ((plan?.fullDaySchedule || [])
                            .slice(0, 7)
                            .reduce(
                              (acc, d) =>
                                acc +
                                d.items
                                  .filter((i) => i.type === 'deep-work' && i.status === 'DONE')
                                  .reduce((a, i) => a + (i.durationMinutes || 90), 0),
                              0,
                            ) /
                            Math.max(
                              1,
                              (plan?.fullDaySchedule || [])
                                .slice(0, 7)
                                .reduce((acc, d) => acc + (d.totalGoalMinutes || 0), 0),
                            )) *
                            100,
                        ),
                      )}
                      onRefit={() =>
                        repackScheduleAroundRoutine(
                          customRoutineBlocks,
                          morningWorkStart,
                          afternoonWorkStart,
                          plan,
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    <GoalSplit
                      totalMinutes={todayGoalMinutes}
                      rows={goals.map((g, idx) => {
                        const mins = todayGoalAllotment.get(g.title)?.minutes || 0
                        return {
                          title: g.title,
                          minutes: mins,
                          share: Math.round((mins / Math.max(1, todayGoalMinutes)) * 100),
                          bar: GOAL_PALETTES[idx % GOAL_PALETTES.length].bar,
                        }
                      })}
                      className="xl:col-span-2"
                    />
                    <RoutineGuard
                      blocks={customRoutineBlocks.map((rb) => ({
                        title: rb.title,
                        range: `${rb.start}–${rb.end}`,
                        minutes: Math.max(15, hhmmToMins(rb.end) - hhmmToMins(rb.start)),
                      }))}
                    />
                  </div>
                  {/* Frosted Glass Telemetry & Day Switcher Strip */}
                  <div className="inner-highlight aurora-sheen flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-slate-900/[0.06] backdrop-blur-md sm:px-5">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3.5 gap-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#11A683] opacity-60" />
                          <span className="relative inline-flex size-2 rounded-full bg-[#11A683]" />
                        </span>
                        <span className="text-slate-500">Work Windows:</span>
                        <strong className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-slate-800">
                          {morningWorkStart} & {afternoonWorkStart}
                        </strong>
                      </div>
                      <span className="hidden text-slate-200 sm:inline">•</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Goal Focus:</span>{' '}
                        <strong className="font-semibold tabular-nums text-[#0E8A6D]">
                          {(todayGoalMinutes / 60).toFixed(1)} hrs ({todayGoalMinutes}m)
                        </strong>
                        <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#0E8A6D] ring-1 ring-emerald-500/20 lg:inline-block">
                          {Math.round((doneGoalMinutes / Math.max(1, todayGoalMinutes)) * 100)}%
                          done
                        </span>
                      </div>
                      <span className="hidden text-slate-200 sm:inline">•</span>
                      <button
                        type="button"
                        onClick={() => setShowRoutineCustomizer((v) => !v)}
                        className="hidden h-8 cursor-pointer items-center gap-1 rounded-lg px-2 font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0E8A6D] sm:inline-flex"
                      >
                        <Edit3 className="size-3" /> Edit Routine
                      </button>
                    </div>

                    <div
                      className="no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-900/[0.04] p-1 ring-1 ring-slate-900/[0.05]"
                      role="tablist"
                      aria-label="Schedule days"
                    >
                      {(plan?.fullDaySchedule || []).slice(0, 5).map((d, idx) => {
                        const isDayActive = selectedDayIdx === idx
                        return (
                          <button
                            key={d.date}
                            type="button"
                            onClick={() => setSelectedDayIdx(idx)}
                            className={`relative cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                              isDayActive ? 'text-[#141414]' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {isDayActive && (
                              <motion.span
                                layoutId="schedule-day-tab-pill"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                className="absolute inset-0 rounded-lg bg-[#CDE06A] shadow-xs"
                              />
                            )}
                            <span className="relative z-10">
                              {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.date.slice(5)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Architectural Timeline Container */}
                  <div className="relative flex flex-col gap-2.5">
                    {/* Continuous Vertical Timeline Spine (Desktop) */}
                    <div className="pointer-events-none absolute bottom-6 left-[146px] top-6 hidden w-px bg-gradient-to-b from-slate-200 via-slate-200/90 to-transparent sm:block" />

                    <AnimatePresence mode="popLayout">
                      {activeItems.map((item) => {
                        const isDeep = item.type === 'deep-work'
                        const isEditing = editingItemId === item.id
                        const { headline, subtitle } = formatTaskTitle(item.title)
                        const palette = getGoalPalette(item.goal, goals)

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className={`group relative overflow-hidden rounded-2xl transition-all duration-200 ${
                              isDeep
                                ? item.status === 'DONE'
                                  ? 'bg-white/70 opacity-80 ring-1 ring-emerald-500/25'
                                  : item.status === 'IN_PROGRESS'
                                    ? 'bg-white shadow-[0_12px_36px_-8px_rgba(17,166,131,0.28)] ring-2 ring-[#11A683]'
                                    : `inner-highlight bg-white hover:-translate-y-[1px] hover:shadow-[0_14px_30px_-8px_rgba(15,23,42,0.12)] ${palette.hoverBorder} ring-1 ring-slate-900/[0.06]`
                                : 'bg-white/70 ring-1 ring-slate-900/[0.05] backdrop-blur-sm hover:bg-white/95'
                            }`}
                          >
                            {/* Subtle Left Accent Bar for Deep-Work Tasks */}
                            {isDeep && (
                              <div
                                className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${palette.bar}`}
                              />
                            )}

                            <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-4">
                                {/* Column 1: Clickable Monospace Time Pill */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    isEditing ? setEditingItemId(null) : startEditingItem(item)
                                  }
                                  title="Click to modify start & end timings"
                                  className="group/time flex w-[124px] shrink-0 cursor-pointer flex-col items-start gap-1 text-left"
                                >
                                  <span className="time-pill rounded-full bg-[#141414] px-3 py-1 font-mono text-xs font-semibold tabular-nums text-white">
                                    {item.start}–{item.end}
                                  </span>
                                  <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] font-medium text-slate-400 group-hover/time:text-slate-600">
                                    {item.durationMinutes}m • Edit
                                  </span>
                                </button>

                                {/* Timeline Node Dot */}
                                <div className="relative mt-2 hidden shrink-0 items-center justify-center sm:flex">
                                  <span
                                    className={`size-2.5 rounded-full transition-transform group-hover:scale-110 ${
                                      isDeep
                                        ? item.status === 'DONE'
                                          ? 'bg-emerald-400 ring-4 ring-emerald-500/10'
                                          : palette.dot
                                        : 'bg-slate-300 ring-4 ring-slate-100'
                                    }`}
                                  />
                                </div>

                                {/* Column 2: Clean Task Headline, Subtitle & Jewel-Tone Goal Badge */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                        isDeep
                                          ? 'bg-[#CDE06A] text-[#141414]'
                                          : 'bg-slate-900/[0.05] text-slate-500'
                                      }`}
                                    >
                                      {isDeep ? item.goal : 'Daily Routine'}
                                    </span>
                                    {item.status === 'IN_PROGRESS' && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-[#0E8A6D]">
                                        Active Session
                                      </span>
                                    )}
                                  </div>

                                  <h3
                                    className={`mt-1 text-sm font-semibold tracking-tight ${
                                      item.status === 'DONE'
                                        ? 'text-slate-400 line-through'
                                        : isDeep
                                          ? 'text-slate-900'
                                          : 'text-slate-700'
                                    }`}
                                  >
                                    {headline}
                                  </h3>

                                  {subtitle && (
                                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                      {subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Column 3: Tactile Single-Row Action Capsule */}
                              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                {isDeep && item.status === 'PLANNED' && (
                                  <button
                                    type="button"
                                    onClick={() => updateBlockStatus(item.id, 'IN_PROGRESS')}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(14,138,109,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:brightness-105"
                                  >
                                    <Play className="size-3 fill-current" /> Start
                                  </button>
                                )}

                                <div className="flex items-center rounded-xl bg-slate-50/80 p-0.5 ring-1 ring-slate-900/[0.07]">
                                  {isDeep && item.status !== 'DONE' && (
                                    <button
                                      type="button"
                                      onClick={() => updateBlockStatus(item.id, 'DONE')}
                                      title="Mark Complete"
                                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-[#0E8A6D]"
                                    >
                                      <Check className="size-3.5 stroke-[2.5]" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      isEditing ? setEditingItemId(null) : startEditingItem(item)
                                    }
                                    title="Modify Start & End Time"
                                    className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                                      isEditing
                                        ? 'bg-[#0B1917] text-[#15C39A]'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                    }`}
                                  >
                                    <Edit3 className="size-3.5" />
                                  </button>

                                  {isDeep && item.status !== 'DONE' && item.status !== 'MISSED' && (
                                    <button
                                      type="button"
                                      onClick={() => updateBlockStatus(item.id, 'MISSED')}
                                      title="Reschedule to Evening Slot"
                                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                    >
                                      <RotateCcw className="size-3.5" />
                                    </button>
                                  )}

                                  {isDeep && (
                                    <button
                                      type="button"
                                      onClick={() => triggerAlarm(item)}
                                      title="Ring Task Alarm"
                                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                                    >
                                      <Bell className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Clean Inline Timing Editor */}
                            {isEditing && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="border-t border-slate-100 bg-slate-50/90 px-5 py-3.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-800">
                                    Modify Timing & Task Details
                                  </span>
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                    <input
                                      type="checkbox"
                                      checked={autoResolveOverlaps}
                                      onChange={(e) => setAutoResolveOverlaps(e.target.checked)}
                                      className="rounded border-slate-300 text-[#11A683]"
                                    />
                                    Auto-shift overlapping tasks
                                  </label>
                                </div>

                                <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:flex-nowrap">
                                  <input
                                    type="time"
                                    value={editStart}
                                    onChange={(e) => setEditStart(e.target.value)}
                                    className="w-24 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                                  />
                                  <span className="text-xs text-slate-400">to</span>
                                  <input
                                    type="time"
                                    value={editEnd}
                                    onChange={(e) => setEditEnd(e.target.value)}
                                    className="w-24 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                                  />
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="min-w-[160px] flex-1 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-2xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveEditedScheduleItem(item.id)}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs"
                                  >
                                    <Check className="size-3.5 stroke-[3]" /> Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteScheduleItem(item.id)}
                                    title="Delete slot"
                                    className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                  <span className="text-[11px] text-slate-500">Quick shift:</span>
                                  {[
                                    {
                                      label: '-30m',
                                      target: minsToHhmm(hhmmToMins(item.start) - 30),
                                    },
                                    {
                                      label: '+30m',
                                      target: minsToHhmm(hhmmToMins(item.start) + 30),
                                    },
                                    {
                                      label: '+1h',
                                      target: minsToHhmm(hhmmToMins(item.start) + 60),
                                    },
                                    { label: '11:00', target: '11:00' },
                                    { label: '16:00', target: '16:00' },
                                    { label: '17:30', target: '17:30' },
                                    { label: '19:00', target: '19:00' },
                                  ].map((preset) => (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => shiftScheduleItemTime(item, preset.target)}
                                      className="cursor-pointer rounded-md border border-slate-200/80 bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700 shadow-2xs hover:border-[#11A683] hover:text-[#0E8A6D]"
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* TAB 2: TAVILY SYLLABUS & MODULES */}
              {tab === 'analysis' && (
                <div className="flex flex-col gap-5">
                  {plan?.goalAnalyses?.map((g) => {
                    const palette = getGoalPalette(g.title, goals)
                    return (
                      <InView
                        key={g.title}
                        once
                        variants={{
                          hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                          visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                      <div
                        className="inner-highlight relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.06] sm:p-6"
                      >
                        <div
                          className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.bar}`}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums ${palette.badge}`}
                          >
                            <Calendar className="size-3.5" /> Due {formatReadableDate(g.deadline)} (
                            {g.daysRemaining}d left)
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                            <span className="size-1.5 rounded-full bg-[#11A683]" />
                            Researched via Tavily Search
                          </span>
                        </div>
                        <BlurText
                          text={g.title}
                          animateBy="words"
                          delay={120}
                          className="mt-2.5 text-balance text-lg font-bold tracking-tight text-slate-900"
                        />
                        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-600">
                          {g.summary}
                        </p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                          <div className="flex flex-col gap-2">
                            <strong className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Syllabus Modules • {g.modules.length}
                            </strong>
                            {g.modules.map((m, i) => {
                              const { headline, subtitle } = formatTaskTitle(m)
                              return (
                                <div
                                  key={i}
                                  className="card-spring rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                                >
                                  <strong className="font-semibold leading-snug text-slate-900">
                                    <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-md bg-[#0B1917] font-mono text-[10px] font-bold text-[#15C39A]">
                                      {i + 1}
                                    </span>
                                    {headline}
                                  </strong>
                                  {subtitle && (
                                    <p className="mt-1 pl-7 text-[11px] leading-relaxed text-slate-500">
                                      {subtitle}
                                    </p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex flex-col gap-2">
                            <strong className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Web Sources (Skiper 40)
                            </strong>
                            {g.sources.map((s, idx) => (
                              <div
                                key={idx}
                                className="card-spring rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs transition-colors hover:border-emerald-200 hover:bg-white"
                              >
                                <Link001
                                  href={s.url || 'https://tavily.com'}
                                  className="font-semibold text-[#0E8A6D]"
                                >
                                  {s.title}
                                </Link001>
                                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                  {s.snippet}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      </InView>
                    )
                  })}
                </div>
              )}

              {/* TAB 3: 7-DAY ROADMAP */}
              {tab === 'roadmap' && (
                <AnimatedGroup preset="blur-slide" className="grid gap-4 sm:grid-cols-2">
                  {(plan?.fullDaySchedule || []).map((day, idx) => (
                    <div
                      key={day.date}
                      className={`inner-highlight rounded-2xl bg-white p-5 ring-1 ${
                        idx === selectedDayIdx
                          ? 'ring-2 ring-[#11A683]'
                          : 'ring-slate-900/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <strong className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
                          {idx === 0 && (
                            <span className="rounded-md bg-[#0B1917] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#15C39A]">
                              Today
                            </span>
                          )}
                          {idx === 0
                            ? 'Today'
                            : idx === 1
                              ? 'Tomorrow'
                              : formatReadableDate(day.date)}
                        </strong>
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-[#0E8A6D]">
                          {(day.totalGoalMinutes / 60).toFixed(1)}h Focus
                        </span>
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        {day.items
                          .filter((i) => i.type === 'deep-work')
                          .map((it) => (
                            <div
                              key={it.id}
                              className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 p-2.5 text-xs ring-1 ring-slate-900/[0.04]"
                            >
                              <span className="shrink-0 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-[#0E8A6D] ring-1 ring-slate-900/[0.06]">
                                {it.start}
                              </span>
                              <span className="line-clamp-1 font-medium leading-snug text-slate-800">
                                {formatTaskTitle(it.title).headline}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </AnimatedGroup>
              )}

              {/* TAB: DAY REPORTS & SUMMARIES */}
              {tab === 'reports' && (
                <div className="flex flex-col gap-4">
                  <div className="inner-highlight flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-slate-900/[0.06] backdrop-blur-md sm:px-5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="size-3.5 text-[#11A683]" />
                      <span>
                        Auto-generated when a day&apos;s blocks all settle · stored on this device
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const today = plan?.fullDaySchedule?.[0]
                        if (!today) {
                          toast.error('No schedule yet — build your plan first.')
                          return
                        }
                        if (reports.some((r) => r.date === today.date)) {
                          toast.info('Today’s report already exists below.')
                          return
                        }
                        const rep = buildDayReport(today, goals)
                        setReports((prev) => [rep, ...prev])
                        toast.success(`Report generated — ${rep.completionPct}% complete`)
                      }}
                      className="btn-shine inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#14B892] to-[#0E8A6D] px-3.5 text-xs font-bold text-white hover:brightness-105"
                    >
                      <Sparkles className="size-3.5" /> Generate today&apos;s report
                    </button>
                  </div>

                  {reports.length === 0 && (
                    <div className="inner-highlight rounded-2xl bg-white p-8 text-center ring-1 ring-slate-900/[0.06]">
                      <FileText className="mx-auto size-8 text-slate-300" />
                      <h3 className="mt-3 text-sm font-bold text-slate-900">No reports yet</h3>
                      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                        Finish all of today&apos;s deep-work blocks (or press generate) and
                        Talverin will write up minutes, per-goal splits, misses and focus
                        sessions automatically.
                      </p>
                    </div>
                  )}

                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="inner-highlight rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.06] sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-slate-900">
                            {formatReadableDate(rep.date)} · Day Report
                          </h3>
                          <p className="mt-0.5 font-mono text-[11px] tabular-nums text-slate-400">
                            {rep.sessionsDone}/{rep.sessionsTotal} sessions · {rep.doneMinutes}m of{' '}
                            {rep.plannedMinutes}m
                          </p>
                        </div>
                        <span className="rounded-xl bg-emerald-500/10 px-3 py-1.5 font-mono text-lg font-bold tabular-nums text-[#0E8A6D] ring-1 ring-emerald-500/20">
                          {rep.completionPct}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${Math.min(100, rep.completionPct)}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#14B892] to-[#0E8A6D]"
                        />
                      </div>
                      {rep.perGoal.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {rep.perGoal.map((g) => (
                            <div
                              key={g.title}
                              className="rounded-xl bg-slate-50/70 p-3 ring-1 ring-slate-900/[0.05]"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <strong className="truncate font-semibold text-slate-900">
                                  {g.title}
                                </strong>
                                <span className="shrink-0 font-mono font-semibold tabular-nums text-[#0E8A6D]">
                                  {g.share}%
                                </span>
                              </div>
                              <div className="mt-1.5 font-mono text-[11px] tabular-nums text-slate-500">
                                {g.minutes}m focused
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {rep.missed.length > 0 && (
                        <div className="mt-3 rounded-xl bg-amber-50/70 p-3 text-xs ring-1 ring-amber-500/20">
                          <span className="font-bold text-amber-800">
                            Missed & rescheduled ({rep.missed.length}):
                          </span>{' '}
                          <span className="text-amber-900">
                            {rep.missed.map((m) => `${m.title} (${m.start})`).join(' · ')}
                          </span>
                        </div>
                      )}
                      {rep.focusSessions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {rep.focusSessions.map((f, i) => (
                            <span
                              key={`${f.start}-${i}`}
                              className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] tabular-nums text-slate-600"
                            >
                              {f.start}–{f.end} · {f.minutes}m
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: AI & SKIPER UI STUDIO */}
              {tab === 'settings' && (
                <div className="inner-highlight rounded-2xl bg-white p-5 ring-1 ring-slate-900/[0.06] sm:p-6">
                  <SkiperBracketBadge>Engine & UI Studio</SkiperBracketBadge>
                  <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                    Live AI Engine & Skiper UI Components
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Powered by NVIDIA Nemotron-3.5-Lightning & Tavily Search API with Skiper UI
                    interactive motion primitives.
                  </p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-900/[0.05]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8A6D]">
                        Skiper 4 & Skiper 26 • SVG Morphing Toggles
                      </span>
                      <div className="mt-3 flex flex-wrap items-center gap-2.5">
                        <ThemeToggleButton1
                          className="size-9 p-1.5"
                          isDark={studioContrastDark}
                          onToggle={() => setStudioContrastDark((d) => !d)}
                        />
                        <ThemeToggleButton2
                          className="size-9 p-2"
                          isDark={studioContrastDark}
                          onToggle={() => setStudioContrastDark((d) => !d)}
                        />
                        <ThemeToggleButton3
                          className="size-9 p-2"
                          isDark={studioContrastDark}
                          onToggle={() => setStudioContrastDark((d) => !d)}
                        />
                        <ThemeToggleButton4
                          className="size-9 p-2"
                          isDark={studioContrastDark}
                          onToggle={() => setStudioContrastDark((d) => !d)}
                        />
                        <ThemeToggleButton5
                          className="size-9 p-2"
                          isDark={studioContrastDark}
                          onToggle={() => setStudioContrastDark((d) => !d)}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-900/[0.05]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8A6D]">
                        Skiper 40 • Animated Cursor Links
                      </span>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-800">
                        <Link001 href="https://skiper-ui.com" className="text-[#0E8A6D]">
                          Skiper UI Registry
                        </Link001>
                        <Link002 href="https://tavily.com" className="text-indigo-700">
                          Tavily Search API
                        </Link002>
                        <Link004 href="https://build.nvidia.com" className="text-slate-900">
                          NVIDIA Nemotron
                        </Link004>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8A6D]">
                      Magic UI • Reactive Surfaces
                    </span>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <ShineBorder
                        borderRadius={18}
                        borderWidth={1.5}
                        duration={10}
                        color={['#15C39A', '#818cf8', '#15C39A']}
                        className="min-w-0"
                      >
                        <div className="relative overflow-hidden rounded-xl px-2 py-3 text-center">
                          <GridPattern
                            width={28}
                            height={28}
                            className="opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                          />
                          <SparklesText
                            className="text-base font-bold tracking-tight text-slate-900"
                            colors={{ first: '#0E8A6D', second: '#6366f1' }}
                            sparklesCount={6}
                          >
                            Shine, sparkle, focus
                          </SparklesText>
                          <p className="relative z-10 mt-1.5 text-[11px] leading-relaxed text-slate-500">
                            Cursor-reactive borders, live sparkles &{' '}
                            <AnimatedShinyText shimmerWidth={80}>
                              shimmering copy
                            </AnimatedShinyText>
                          </p>
                        </div>
                      </ShineBorder>

                      <NeonGradientCard
                        borderRadius={18}
                        neonColors={{ firstColor: '#15C39A', secondColor: '#6366f1' }}
                      >
                        <Magnetic intensity={0.25} range={140}>
                          <div className="text-center">
                            <strong className="text-sm font-bold tracking-tight text-slate-900">
                              Magnetic neon card
                            </strong>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                              Drift your cursor over this card — it leans
                              toward you with spring physics.
                            </p>
                          </div>
                        </Magnetic>
                      </NeonGradientCard>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8A6D]">
                      Animation Lab • Custom builds
                    </span>
                    <div className="mt-3 flex flex-col gap-4">
                      <BentoGrid />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-900/[0.06]">
                          <TopoFlow className="h-64" />
                        </div>
                        <ParticleText word="TALVERIN" className="h-64 rounded-2xl" />
                        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-900/[0.06]">
                          <StaffBadge className="h-80" />
                        </div>
                        <GlowCard>
                          <div className="flex items-center gap-5">
                            <RingProgress />
                            <div>
                              <strong className="block text-sm font-bold text-white">
                                Spring-synced ring
                              </strong>
                              <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                                Arc and count share one spring. Card border
                                spins a 25% indigo arc — hover to double
                                its speed.
                              </p>
                            </div>
                          </div>
                        </GlowCard>
                        <div className="flex items-center justify-around gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.06]">
                          <ElasticToggle />
                          <MagneticButton>Hover me</MagneticButton>
                        </div>
                        <div className="flex items-center justify-center rounded-2xl bg-zinc-100 p-6 ring-1 ring-slate-900/[0.06]">
                          <GooeyNav />
                        </div>
                        <InViewCounterDemo />
                      </div>
                      <div className="rounded-2xl bg-[#050608] p-6 ring-1 ring-slate-900/[0.06] sm:p-8">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E8A6D]">
                          AuroraGlowInput • live form
                        </span>
                        <div className="mx-auto mt-4 max-w-md">
                          <AuroraGlowInput
                            label="Get early access"
                            placeholder="you@studio.com"
                            cta="Notify me"
                            done="You're on the list — check your inbox."
                            failed="Enter a valid email to join."
                            note="Early access · one email a month."
                            palette="boreal"
                            onJoin={async () => {
                              await new Promise((r) => setTimeout(r, 900));
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-3 rounded-2xl bg-[#101014] p-8 text-center ring-1 ring-slate-900/[0.06]">
                        <InViewCounter
                          to={2026}
                          className="font-mono text-5xl font-bold tabular-nums text-white"
                        />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                          scroll
                          <br />
                          replay
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB 5: AI CHAT - Full-width in center pane */}
              {tab === 'chat' && (
                <div className="flex flex-col h-full">
                  <AiChatFullScreen
                    messages={chatMsgs}
                    typing={chatTyping}
                    onSend={(t, images, files) => void sendChat(t, images, files)}
                    onClose={() => setTab('plan')}
                    goals={goals}
                    isDark={studioContrastDark}
                  />
                </div>
              )}
            </div>
            {/* Mobile bottom spacing for floating nav + focus player */}
            <div className="h-24 md:hidden" aria-hidden="true" />
          </main>

          {/* PANE 3 (RIGHT): High-Craft Telemetry & Goal Inspector (296px) */}
          <aside className="glass-panel hidden w-[296px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-slate-900/[0.06] p-5 xl:flex">
            <Tilt rotationFactor={7}>
              <GrammarlyScoreRing
                score={assistantScore}
                label={`${(capacity / 60).toFixed(1)} hrs/day Goal Focus`}
                sublabel={`Starts ${morningWorkStart} & ${afternoonWorkStart}`}
              />
            </Tilt>

            {/* Active Goals with Jewel-Tone Progress Bars */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Active Goals ({goals.length})
                </span>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="cursor-pointer text-[11px] font-semibold text-[#0E8A6D] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {goals.map((g, idx) => {
                  const dLeft = daysUntilYmd(g.date)
                  const todayAlloc = todayGoalAllotment.get(g.title)
                  const allocMins = todayAlloc?.minutes || 90
                  const sharePct = Math.min(
                    100,
                    Math.max(20, Math.round((allocMins / Math.max(90, todayGoalMinutes)) * 100)),
                  )
                  const palette = GOAL_PALETTES[idx % GOAL_PALETTES.length]
                  const urgent = dLeft <= 3

                  return (
                    <div
                      key={g.id}
                      className="card-spring group rounded-2xl bg-white p-3.5 ring-1 ring-slate-900/[0.06] hover:ring-slate-900/[0.12]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="line-clamp-2 text-xs font-semibold leading-snug tracking-tight text-slate-900">
                          {g.title}
                        </strong>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                            urgent
                              ? 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/25'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {dLeft}d
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <span
                            className={`size-1.5 rounded-full bg-gradient-to-r ${palette.bar}`}
                          />
                          {g.priority} • {g.category}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-slate-700">
                          {todayAlloc ? `${todayAlloc.minutes}m today` : 'Scheduled'}
                        </span>
                      </div>

                      {/* Subtle Allotment Progress Bar */}
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sharePct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                          className={`h-full rounded-full bg-gradient-to-r ${palette.bar}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Connected Mini-Timeline Daily Rhythm Card */}
            <div className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-900/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Daily Rhythm
                </span>
                <button
                  type="button"
                  onClick={() => setShowRoutineCustomizer((v) => !v)}
                  className="cursor-pointer text-[11px] font-semibold text-[#0E8A6D] hover:underline"
                >
                  Customize
                </button>
              </div>
              <div className="relative mt-3 flex flex-col gap-2 pl-3 before:absolute before:bottom-1.5 before:left-[3px] before:top-1.5 before:w-px before:bg-slate-200">
                {customRoutineBlocks.slice(0, 4).map((rb) => (
                  <div
                    key={rb.id}
                    className="relative flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="absolute -left-[11.5px] size-1.5 rounded-full bg-slate-400 ring-2 ring-slate-50" />
                    <span className="truncate font-medium text-slate-700">{rb.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400">
                      {rb.start}–{rb.end}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-200/60 pt-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                <AlarmClock className="size-3.5 text-[#11A683]" /> Alarms Armed
              </span>
              <Link005 href="https://tavily.com" className="font-medium text-slate-500">
                Tavily + NVIDIA AI
              </Link005>
            </div>
          </aside>
        </>
      )}

      {/* Floating Focus Player when a task is IN_PROGRESS */}
      <AnimatePresence>
        {activeFocusItem && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-20 left-1/2 z-40 flex w-[92%] max-w-xl -translate-x-1/2 flex-col gap-2 rounded-2xl bg-gradient-to-r from-[#091412] via-[#0F2420] to-[#091412] px-5 pb-3 pt-3 text-white shadow-[0_20px_50px_rgba(9,20,18,0.45)] ring-1 ring-[#15C39A]/35 md:bottom-5"
          >
            <BorderBeam
              size={140}
              duration={8}
              colorFrom="#CDE06A"
              colorTo="#5b5b52"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <MediaArt
                  variant="orb"
                  alt=""
                  className="size-10 shrink-0 rounded-xl ring-1 ring-white/15"
                />
                <div className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-[#15C39A]">
                    Focus Session • {activeFocusItem.goal}
                  </span>
                  <strong className="block truncate text-xs font-bold text-white">
                    {formatTaskTitle(activeFocusItem.title).headline}
                  </strong>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-[#15C39A]">
                  {formatTimer(focusSecondsLeft)}
                </span>
                <SkiperMorphPlayPauseButton
                  isPaused={focusPaused}
                  onTogglePause={() => setFocusPaused((p) => !p)}
                  onReset={() => setFocusSecondsLeft((activeFocusItem.durationMinutes || 90) * 60)}
                />
                <button
                  type="button"
                  onClick={() => updateBlockStatus(activeFocusItem.id, 'DONE')}
                  className="btn-shine inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-b from-[#18D2A6] to-[#11A683] px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Check className="size-3.5 stroke-[3]" /> Done
                </button>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#15C39A] to-[#18D2A6] transition-all duration-1000"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      ((activeFocusItem.durationMinutes * 60 - focusSecondsLeft) /
                        Math.max(1, activeFocusItem.durationMinutes * 60)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom navigation (workspace only, <md) */}
      {step >= 6 && (
        <nav
          aria-label="Workspace"
          className="glass-panel pb-safe fixed inset-x-3 bottom-3 z-40 flex items-center justify-around gap-1 rounded-2xl border border-slate-900/[0.08] px-2 py-2 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] md:hidden"
        >
          {[
            { id: 'plan', label: 'Schedule', icon: LayoutDashboard },
            { id: 'analysis', label: 'Syllabus', icon: BookOpen },
            { id: 'roadmap', label: 'Roadmap', icon: Layers },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'chat', label: 'Chat', icon: MessageCircleHeart },
            { id: 'settings', label: 'Studio', icon: Settings },
          ].map((v) => {
            const Icon = v.icon
            const active = tab === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setTab(v.id as 'plan' | 'analysis' | 'roadmap' | 'reports' | 'settings')}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-[10px] font-bold transition-colors ${
                  active ? 'bg-[#0B1917] text-[#15C39A]' : 'text-slate-500'
                }`}
              >
                <Icon className="size-4" />
                {v.label}
              </button>
            )
          })}
        </nav>
      )}

      {/* Edge companion — Grammarly-style right-edge tab with now/next */}
      {step >= 6 && (
        <EdgeCompanion
          items={activeItems}
          nowM={hhmmToMins(nowHhmm())}
          onStart={(id) => updateBlockStatus(id, 'IN_PROGRESS')}
          onDone={(id) => updateBlockStatus(id, 'DONE')}
          onOpenReports={() => setTab('reports')}
        />
      )}

      {/* AI companion chat */}
      {step >= 6 && !chatOpen && <AiChatFab onOpen={() => setChatOpen(true)} />}
      <AnimatePresence>
        {step >= 6 && chatOpen && (
          <AiChatPanel
            messages={chatMsgs}
            typing={chatTyping}
            onSend={(t) => void sendChat(t)}
            onClose={() => setChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
