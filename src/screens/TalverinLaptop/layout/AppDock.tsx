import {
  Bell,
  Check,
  CircleUserRound,
  Compass,
  CalendarRange,
  Sparkles,
  Cpu,
  Plus,
  Clock,
  Target,
  GraduationCap,
  Layers,
  CalendarClock,
} from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { NavView, Profile, Step } from "../types";

interface Props {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  completedSteps: Step[];
  profile: Profile;
  onRingAlarm: () => void;
}

interface NavItem {
  view: NavView;
  label: string;
  icon: LucideIcon;
  stepIndex?: number;
}

const setupItems: NavItem[] = [
  { view: 0, label: "Identity & Role", icon: CircleUserRound, stepIndex: 0 },
  { view: 1, label: "Daily Hours & Rhythm", icon: Clock, stepIndex: 1 },
  { view: 2, label: "AI Goal Studio", icon: Sparkles, stepIndex: 2 },
  { view: 3, label: "Deadlines & Tavily", icon: CalendarClock, stepIndex: 3 },
];

const workspaceItems: NavItem[] = [
  { view: "schedule", label: "Full-Day Schedule", icon: CalendarRange },
  { view: "syllabus", label: "Tavily Syllabus", icon: Layers },
  { view: "roadmap", label: "7-Day Roadmap", icon: Compass },
  { view: "engine", label: "AI Engine Status", icon: Cpu },
];

export const AppDock = ({ currentView, onNavigate, completedSteps, profile, onRingAlarm }: Props) => {
  const isActive = (view: NavView) => currentView === view;

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-[#0F1F1C] text-white">
      {/* Brand header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#15C39A]">
          <Target className="h-4.5 w-4.5 text-[#0F1F1C]" strokeWidth={2.5} />
          <motion.div
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.8, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-lg bg-[#15C39A]"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold leading-tight tracking-tight">talverin</span>
          <span className="text-[10px] font-medium text-[#15C39A]/70 leading-tight">Personal AI Desktop</span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => onNavigate(2)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#15C39A] px-4 py-2.5 text-[12px] font-semibold text-[#0F1F1C] transition-all hover:bg-[#11A683] hover:shadow-[0_0_20px_rgba(21,194,154,0.3)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add / Discover Goals
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <p className="px-2 pb-2 pt-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Setup Steps
        </p>
        <div className="flex flex-col gap-0.5">
          {setupItems.map((item) => {
            const active = isActive(item.view);
            const done = item.stepIndex !== undefined && completedSteps.includes(item.stepIndex as Step);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#15C39A]" : "text-white/40 group-hover:text-white/70"}`} strokeWidth={2} />
                <span className="flex-1 truncate">{item.label}</span>
                {done && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#15C39A]/20">
                    <Check className="h-2.5 w-2.5 text-[#15C39A]" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="px-2 pb-2 pt-5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Workspace Views
        </p>
        <div className="flex flex-col gap-0.5">
          {workspaceItems.map((item) => {
            const active = isActive(item.view);
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#15C39A]" : "text-white/40 group-hover:text-white/70"}`} strokeWidth={2} />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Alarm + Profile */}
      <div className="border-t border-white/10 px-3 pt-3 pb-4">
        <button
          type="button"
          onClick={onRingAlarm}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#15C39A]/30 bg-[#15C39A]/10 px-4 py-2.5 text-[12px] font-semibold text-[#15C39A] transition-all hover:bg-[#15C39A]/20"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          Ring Laptop Alarm
        </button>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#15C39A]/20">
            <GraduationCap className="h-4 w-4 text-[#15C39A]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">{profile.name || "Guest User"}</p>
            <p className="truncate text-[10px] text-white/40">Free Plan · 1 seat</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
