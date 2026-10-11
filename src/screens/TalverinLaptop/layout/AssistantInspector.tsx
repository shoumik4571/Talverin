import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  ChevronRight,
  Layers,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Goal, Profile, Routine } from "../types";
import { capacities, getGoalIcon } from "../data";

interface Props {
  profile: Profile;
  routine: Routine;
  goals: Goal[];
  alarmArmed: boolean;
}

interface SuggestionCard {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  title: string;
  body: string;
  badge?: string;
}

export const AssistantInspector = ({ profile, routine, goals, alarmArmed }: Props) => {
  const [score, setScore] = useState(0);
  const cap = capacities.find((c) => c.id === routine.capacity);
  const targetScore = 96;

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setScore((s) => {
          if (s >= targetScore) {
            clearInterval(interval);
            return targetScore;
          }
          return s + 2;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (score / 100) * circumference;

  const daysRemaining = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date("2026-10-11");
    return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const suggestions: SuggestionCard[] = [
    {
      icon: Zap,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderColor: "border-l-emerald-500",
      title: "Capacity Optimization",
      body: `${cap?.modules ?? 4} × ${cap?.moduleLength ?? 90}-minute deep-work blocks scheduled across your day.`,
      badge: "Optimal",
    },
    ...goals.slice(0, 3).map((g) => {
      const Icon = getGoalIcon(g.iconName);
      return {
        icon: Icon,
        iconColor: "text-violet-600",
        iconBg: "bg-violet-50",
        borderColor: "border-l-violet-500",
        title: g.title,
        body: g.description,
        badge: `${daysRemaining(g.date)}d left`,
      } as SuggestionCard;
    }),
    {
      icon: Bell,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      borderColor: "border-l-amber-500",
      title: "Laptop Audio Alarm",
      body: alarmArmed
        ? "Alarm armed. Daylight chime will ring at session boundaries."
        : "Alarm disarmed. Ring a test to verify laptop speakers.",
      badge: alarmArmed ? "Armed" : "Disarmed",
    },
  ];

  return (
    <aside className="flex h-screen w-[340px] shrink-0 flex-col overflow-y-auto border-l border-[#E4E8EC] bg-white">
      {/* Score Ring */}
      <div className="flex flex-col items-center border-b border-[#E4E8EC] px-6 pt-6 pb-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Day Readiness Score
        </p>
        <div className="relative flex h-[130px] w-[130px] items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="8" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#11A683"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ ease: "easeOut" }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-bold tabular-nums text-slate-900">{score}</span>
            <span className="text-[10px] font-medium text-slate-400">out of 100</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
          <Activity className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
          <span className="text-[11px] font-semibold text-emerald-700">Excellent alignment</span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          AI Suggestions
        </p>
        {suggestions.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={`${card.title}-${i}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl border border-[#E4E8EC] border-l-4 ${card.borderColor} bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold text-slate-900">{card.title}</p>
                    {card.badge && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{card.body}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Goal count summary */}
        <div className="mt-1 flex items-center justify-between rounded-xl bg-[#F5F7F9] px-4 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" strokeWidth={2} />
            <span className="text-[11px] font-medium text-slate-600">{goals.length} active goals</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2} />
        </div>
      </div>
    </aside>
  );
};
