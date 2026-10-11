import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bell,
  CalendarRange,
  Check,
  ChevronRight,
  Clock,
  Cpu,
  ExternalLink,
  Layers,
  Pause,
  Play,
  Search,
  Sparkles,
  Square,
  Target,
  Zap,
} from "lucide-react";
import { capacities, generateRoadmap, getGoalIcon, habitPills, roles, tavilyModules } from "../data";
import type { Goal, NavView, Profile, Routine } from "../types";

interface Props {
  profile: Profile;
  routine: Routine;
  goals: Goal[];
  activeView: NavView;
  onNavigate: (v: NavView) => void;
  onRingAlarm: () => void;
  alarmOpen: boolean;
  alarmPlaying: boolean;
  onPlayAlarm: () => void;
  onStopAlarm: () => void;
  onCloseAlarm: () => void;
}

interface TimelineBlock {
  title: string;
  time: string;
  startMin: number;
  duration: number;
  type: "deep" | "fixed" | "habit" | "buffer";
  goalIndex?: number;
}

const HOUR_PX = 56;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildTimeline(routine: Routine, goals: Goal[]): TimelineBlock[] {
  const cap = capacities.find((c) => c.id === routine.capacity);
  if (!cap) return [];

  const wakeMin = timeToMinutes(routine.wakeTime);
  const blocks: TimelineBlock[] = [];

  const selectedHabits = habitPills.filter((h) => routine.habits.includes(h.id));
  const habitBlocks: { startMin: number; duration: number; title: string; time: string; isFixed?: boolean }[] = [];

  for (const habit of selectedHabits) {
    const hMin = timeToMinutes(habit.time);
    habitBlocks.push({
      startMin: hMin - wakeMin,
      duration: habit.duration,
      title: habit.label,
      time: `${habit.time}–${minutesToTime(hMin + habit.duration)}`,
    });
  }

  if (routine.fixedHours) {
    habitBlocks.push({
      startMin: timeToMinutes("09:30") - wakeMin,
      duration: 180,
      title: "Fixed office hours",
      time: "09:30–12:30",
      isFixed: true,
    });
  }

  const moduleLength = cap.moduleLength;
  const gapMin = 30;
  let cursor = 30;
  let goalIdx = 0;

  const blocked = (start: number, dur: number) =>
    habitBlocks.some((hb) => start < hb.startMin + hb.duration && start + dur > hb.startMin);

  const advancePastHabits = (pos: number) => {
    let p = pos;
    for (const hb of [...habitBlocks].sort((a, b) => a.startMin - b.startMin)) {
      if (p + moduleLength <= hb.startMin || p >= hb.startMin + hb.duration) continue;
      p = hb.startMin + hb.duration + gapMin;
    }
    return p;
  };

  for (let m = 0; m < cap.modules && goalIdx < goals.length; m++) {
    cursor = advancePastHabits(cursor);
    while (blocked(cursor, moduleLength)) {
      cursor += moduleLength + gapMin;
      cursor = advancePastHabits(cursor);
    }
    const goal = goals[goalIdx % goals.length];
    blocks.push({
      title: goal.title,
      time: `${minutesToTime(wakeMin + cursor)}–${minutesToTime(wakeMin + cursor + moduleLength)}`,
      startMin: cursor,
      duration: moduleLength,
      type: "deep",
      goalIndex: goalIdx % goals.length,
    });
    cursor += moduleLength + gapMin;
    goalIdx++;
  }

  for (const hb of habitBlocks) {
    blocks.push({
      title: hb.title,
      time: hb.time,
      startMin: hb.startMin,
      duration: hb.duration,
      type: hb.isFixed ? "fixed" : "habit",
    });
  }

  return blocks.sort((a, b) => a.startMin - b.startMin);
}

export const Step5Dashboard = (props: Props) => {
  const { profile, routine, goals, activeView, onNavigate, onRingAlarm, alarmOpen, alarmPlaying, onPlayAlarm, onStopAlarm, onCloseAlarm } = props;
  const cap = capacities.find((c) => c.id === routine.capacity);
  const role = roles.find((r) => r.id === profile.role);
  const [focusTask, setFocusTask] = useState<TimelineBlock | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const timeline = useMemo(() => buildTimeline(routine, goals), [routine, goals]);
  const totalSpan = useMemo(() => {
    const end = timeline.reduce((max, b) => Math.max(max, b.startMin + b.duration), 0);
    return Math.max(end + 30, 960);
  }, [timeline]);

  const wakeMin = timeToMinutes(routine.wakeTime);
  const hours = useMemo(() => {
    const arr: string[] = [];
    const wakeH = Math.floor(wakeMin / 60);
    for (let i = 0; wakeH + i < 24; i++) {
      arr.push(`${String(wakeH + i).padStart(2, "0")}:00`);
      if (arr.length >= 17) break;
    }
    return arr;
  }, [wakeMin]);

  const tavilyData = useMemo(() => tavilyModules(goals), [goals]);
  const roadmap = useMemo(() => generateRoadmap(goals, cap?.minutes ?? 360), [goals, cap]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const kpiCards = [
    { label: "Deep-work capacity", value: `${cap?.minutes ?? 0}m`, desc: `${cap?.modules ?? 0} × ${cap?.moduleLength ?? 0}m modules`, icon: Zap, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Active goals", value: String(goals.length).padStart(2, "0"), desc: "One meaningful step each", icon: Target, iconColor: "text-sky-600", iconBg: "bg-sky-50" },
    { label: "Daily rhythm", value: `${routine.wakeTime.slice(0, 2)}–${routine.sleepTime.slice(0, 2)}`, desc: "Routines protected", icon: Clock, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
    { label: "Next milestone", value: goals[0]?.date ?? "—", desc: goals[0]?.title.slice(0, 20) ?? "", icon: CalendarRange, iconColor: "text-violet-600", iconBg: "bg-violet-50" },
  ];

  const typeStyles: Record<TimelineBlock["type"], { bg: string; border: string; text: string; sub: string }> = {
    deep: { bg: "bg-[#0F1F1C]", border: "border-[#0F1F1C]", text: "text-white", sub: "text-[#15C39A]" },
    fixed: { bg: "bg-[#F0F2F5]", border: "border-[#E4E8EC]", text: "text-slate-700", sub: "text-slate-400" },
    habit: { bg: "bg-[#EDF8F5]", border: "border-[#D4EDE4]", text: "text-slate-700", sub: "text-slate-400" },
    buffer: { bg: "bg-[#F5F7F9]", border: "border-[#E4E8EC]", text: "text-slate-700", sub: "text-slate-400" },
  };

  const startFocus = (block: TimelineBlock) => {
    setFocusTask(block);
    setElapsed(0);
    setTimerRunning(true);
  };

  const stopFocus = () => {
    setTimerRunning(false);
    setFocusTask(null);
    setElapsed(0);
  };

  const viewLabel =
    activeView === "schedule" ? "Full-Day Schedule" :
    activeView === "syllabus" ? "Tavily Syllabus" :
    activeView === "roadmap" ? "7-Day Roadmap" :
    activeView === "engine" ? "AI Engine Status" : "Dashboard";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Workspace tabs */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-[#E4E8EC] bg-white px-4 py-2.5">
        {[
          { id: "schedule" as NavView, label: "Full-Day Schedule", icon: CalendarRange },
          { id: "syllabus" as NavView, label: "Tavily Syllabus", icon: Layers },
          { id: "roadmap" as NavView, label: "7-Day Roadmap", icon: Target },
          { id: "engine" as NavView, label: "AI Engine Status", icon: Cpu },
        ].map((tab) => {
          const active = activeView === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-medium transition-all ${
                active
                  ? "bg-[#0F1F1C] text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {activeView === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-5"
            >
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpiCards.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-[#E4E8EC] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.iconBg}`}>
                          <Icon className={`h-4 w-4 ${item.iconColor}`} strokeWidth={2} />
                        </div>
                      </div>
                      <p className="mt-3 text-[24px] font-bold leading-none text-slate-900">{item.value}</p>
                      <p className="mt-2.5 text-[10px] text-slate-400">{item.desc}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-[#E4E8EC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[16px] font-bold text-slate-900">Today&apos;s composition</h2>
                    <p className="text-[11px] text-slate-500">
                      {routine.wakeTime}–{routine.sleepTime} · every hour has its place
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    {cap?.minutes ?? 0} / {cap?.minutes ?? 0}m planned
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-4">
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#0F1F1C]" /> Deep work
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#F0F2F5]" /> Fixed hours
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-[#EDF8F5]" /> Habits &amp; life
                  </span>
                </div>

                <div className="relative w-full overflow-x-auto">
                  <div className="relative min-w-[640px]" style={{ height: totalSpan * (HOUR_PX / 60) + 20 }}>
                    {hours.map((hour, index) => (
                      <div
                        key={hour}
                        className="absolute left-0 flex w-[640px] items-center gap-3"
                        style={{ top: `${index * HOUR_PX}px` }}
                      >
                        <span className="w-[38px] text-[10px] font-medium tabular-nums text-slate-400">{hour}</span>
                        <span className="h-px flex-1 bg-[#F0F2F5]" />
                      </div>
                    ))}

                    {timeline.map((block, i) => {
                      const top = (block.startMin / 60) * HOUR_PX;
                      const height = (block.duration / 60) * HOUR_PX - 4;
                      const style = typeStyles[block.type];
                      const isDeep = block.type === "deep";
                      return (
                        <motion.div
                          key={`${block.title}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`absolute left-12 flex w-[580px] flex-col gap-[2px] rounded-lg border px-3 py-2 ${style.bg} ${style.border}`}
                          style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className={`truncate text-[11px] font-semibold ${style.text}`}>
                              {block.title}
                            </span>
                            <span className={`shrink-0 text-[9px] tabular-nums ${style.sub}`}>
                              {block.time}
                            </span>
                          </div>
                          {isDeep && (
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-[#15C39A]">
                                {goals[block.goalIndex ?? 0]?.priority} priority
                              </span>
                              <button
                                type="button"
                                onClick={() => startFocus(block)}
                                className="flex items-center gap-1 rounded-full bg-[#15C39A] px-2 py-0.5 text-[9px] font-semibold text-[#0F1F1C] transition-colors hover:bg-[#11A683]"
                              >
                                <Play className="h-2.5 w-2.5" strokeWidth={2.5} />
                                Start focus
                              </button>
                            </div>
                          )}
                          {!isDeep && block.duration >= 60 && (
                            <span className="text-[10px] text-slate-400">{block.time}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Daily brief + goals sidebar */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-[#E4E8EC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="mb-2.5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
                      <Sparkles className="h-4 w-4 text-violet-600" strokeWidth={2} />
                    </div>
                    <h2 className="text-[14px] font-bold text-slate-900">Your daily brief</h2>
                  </div>
                  <p className="text-[13px] font-semibold text-slate-900">Depth before speed.</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                    Your highest-priority goal comes first, while your mind is fresh. Keep each module to one tangible outcome.
                  </p>
                  <p className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <Cpu className="h-3 w-3" strokeWidth={2} />
                    NVIDIA Nemotron-3.5-Lightning
                  </p>
                </div>

                <div className="rounded-xl border border-[#E4E8EC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <h2 className="mb-2.5 text-[14px] font-bold text-slate-900">
                    {goals.length} goals, one clear day.
                  </h2>
                  {goals.map((goal) => {
                    const Icon = getGoalIcon(goal.iconName);
                    return (
                      <div key={goal.id} className="flex flex-col gap-1 border-b border-[#F0F2F5] py-2 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                            <Icon className="h-3.5 w-3.5 text-slate-600" strokeWidth={2} />
                          </div>
                          <p className="flex-1 text-[12px] font-semibold text-slate-900">{goal.title}</p>
                        </div>
                        <p className="pl-8 text-[11px] text-slate-500">{goal.description}</p>
                        <p className="pl-8 text-[10px] font-medium text-emerald-600">
                          {goal.date} · {goal.priority} · {goal.pace}m / day
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === "syllabus" && (
            <motion.div
              key="syllabus"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              {tavilyData.map((mod, i) => {
                const Icon = getGoalIcon(goals[i]?.iconName ?? "target");
                return (
                  <motion.div
                    key={mod.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-[#E4E8EC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        <Icon className="h-4.5 w-4.5 text-slate-600" strokeWidth={2} />
                      </div>
                      <h3 className="text-[15px] font-bold text-slate-900">{mod.title}</h3>
                    </div>
                    <p className="mb-3.5 text-[12px] text-slate-500">{mod.description}</p>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Decomposed Syllabus Modules
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {["Fundamentals", "Core concepts", "Advanced patterns", "Practical project", "Review & mock"].map((s) => (
                        <span key={s} className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700">
                          <Layers className="h-3 w-3" strokeWidth={2} />
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Web Sources
                    </p>
                    <div className="flex flex-col gap-2">
                      {mod.sources.map((src) => (
                        <div
                          key={src.title}
                          className="flex items-center justify-between rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3.5 py-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                            <span className="text-[12px] font-medium text-slate-900">{src.title}</span>
                          </div>
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[9px] font-semibold text-sky-700">Tavily</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeView === "roadmap" && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
            >
              {roadmap.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-[#E4E8EC] bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <p className="mb-0.5 text-[10px] font-semibold text-emerald-600">{day.date}</p>
                  <p className="mb-3 text-[13px] font-bold text-slate-900">{day.dayLabel}</p>
                  <div className="flex flex-col gap-2">
                    {day.tasks.map((task, j) => (
                      <div key={j} className="rounded-lg bg-[#F5F7F9] p-2.5">
                        <p className="text-[9px] text-slate-400">{task.goal}</p>
                        <p className="text-[11px] font-semibold text-slate-900">{task.task}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-emerald-600">
                          <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                          {task.minutes}m
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeView === "engine" && (
            <motion.div
              key="engine"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              {[
                { name: "NVIDIA Nemotron-3.5-Lightning", status: "Active", desc: "Neural personalization engine", icon: Cpu, color: "text-emerald-600", bg: "bg-emerald-50" },
                { name: "Tavily Search API", status: "Connected", desc: "Real-time web research & syllabus decomposition", icon: Search, color: "text-sky-600", bg: "bg-sky-50" },
                { name: "Web Audio Alarm System", status: "Armed", desc: "Daylight chime via laptop speakers", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" },
                { name: "Timeline Scheduler", status: "Running", desc: "Packing deep-work modules into your daily rhythm", icon: CalendarRange, color: "text-violet-600", bg: "bg-violet-50" },
              ].map((engine, i) => {
                const Icon = engine.icon;
                return (
                  <motion.div
                    key={engine.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 rounded-xl border border-[#E4E8EC] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${engine.bg}`}>
                      <Icon className={`h-5 w-5 ${engine.color}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-slate-900">{engine.name}</p>
                      <p className="text-[11px] text-slate-500">{engine.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-2 w-2 rounded-full bg-emerald-500"
                      />
                      <span className="text-[11px] font-semibold text-emerald-700">{engine.status}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Focus Timer */}
      <AnimatePresence>
        {focusTask && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-white bg-white/90 px-5 py-3 shadow-[0_8px_32px_rgba(15,31,28,0.15)] backdrop-blur-md"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2.5 w-2.5 rounded-full bg-[#15C39A]"
            />
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">
                Focus Active · {focusTask.type === "deep" ? "Deep Work" : focusTask.type}
              </span>
              <span className="text-[12px] font-semibold text-slate-900">{focusTask.title}</span>
            </div>
            <span className="text-[22px] font-bold tabular-nums text-slate-900">
              {formatTime(elapsed)}
            </span>
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              {timerRunning ? <Pause className="h-4 w-4" strokeWidth={2} /> : <Play className="h-4 w-4" strokeWidth={2} />}
            </button>
            <button
              type="button"
              onClick={stopFocus}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <Square className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Laptop Alarm Modal */}
      <AnimatePresence>
        {alarmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0F1F1C]/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex w-full max-w-[400px] flex-col gap-5 rounded-2xl border border-[#E4E8EC] bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <Bell className="h-4.5 w-4.5 text-amber-600" strokeWidth={2} />
                  </div>
                  <h2 className="text-[18px] font-bold text-slate-900">Laptop Alarm</h2>
                </div>
                <button
                  type="button"
                  onClick={() => { onStopAlarm(); onCloseAlarm(); }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100"
                >
                  <Square className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Animated 5-bar waveform */}
              <div className="flex h-[80px] items-center justify-center gap-2.5">
                {["h-6", "h-[44px]", "h-16", "h-[44px]", "h-6"].map((height, i) => (
                  <motion.span
                    key={i}
                    animate={alarmPlaying ? { scaleY: [1, 1.6, 0.6, 1.3, 1] } : { scaleY: 1 }}
                    transition={alarmPlaying ? { duration: 0.6, repeat: Infinity, delay: i * 0.1 } : {}}
                    className={`w-2.5 ${height} origin-center rounded-md bg-[#15C39A]`}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-[#E4E8EC] bg-[#F5F7F9] p-3.5">
                <p className="text-[12px] font-semibold text-slate-900">A gentle return to focus.</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                  Preview your laptop&apos;s sound before your next session. Keep this tab open and your laptop awake.
                </p>
                <button
                  type="button"
                  onClick={alarmPlaying ? onStopAlarm : onPlayAlarm}
                  className={`mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-semibold text-white transition-colors ${
                    alarmPlaying ? "bg-rose-600 hover:bg-rose-700" : "bg-[#15C39A] hover:bg-[#11A683]"
                  }`}
                >
                  {alarmPlaying ? (
                    <>
                      <Square className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Stop Alarm
                    </>
                  ) : (
                    <>
                      <Bell className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Ring Laptop Alarm
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[9px] uppercase tracking-wide text-slate-400">
                  Sound preview · daylight chime · 5 seconds
                </p>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-3">
                <Activity className="h-4 w-4 text-slate-400" strokeWidth={2} />
                <p className="flex-1 text-[10px] text-slate-500">
                  Laptop speakers · volume 70%
                  <br />
                  Your focus session continues behind this dialog.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


