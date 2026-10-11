import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, CalendarClock, CalendarDays, Search, Zap } from "lucide-react";
import type { Goal, Routine, Priority } from "../types";
import { capacities, getGoalIcon } from "../data";

interface Props {
  goals: Goal[];
  setGoals: (g: Goal[]) => void;
  routine: Routine;
  onLaunch: () => void;
  onBack: () => void;
}

const priorities: { id: Priority; color: string; bg: string; border: string }[] = [
  { id: "High", color: "text-rose-700", bg: "bg-rose-100", border: "border-rose-400" },
  { id: "Medium", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400" },
  { id: "Normal", color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-400" },
];

const quickPills = ["+5d", "+10d", "+14d", "+30d"];

export const Step4Calendar = ({ goals, setGoals, routine, onLaunch, onBack }: Props) => {
  const [researching, setResearching] = useState(false);
  const cap = capacities.find((c) => c.id === routine.capacity);

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const applyQuickPill = (id: string, pill: string) => {
    const days = parseInt(pill.replace("+", "").replace("d", ""));
    const base = new Date("2026-10-11");
    base.setDate(base.getDate() + days);
    updateGoal(id, { date: base.toISOString().slice(0, 10) });
  };

  const handleLaunch = () => {
    setResearching(true);
    setTimeout(() => {
      setResearching(false);
      onLaunch();
    }, 2500);
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-[24px] font-bold leading-tight text-slate-900">
          Set your target dates
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Pick a deadline, priority, and pace for each goal. TALVERIN will research and build your schedule.
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {goals.map((goal, i) => {
          const Icon = getGoalIcon(goal.iconName);
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="rounded-xl border border-[#E4E8EC] bg-white p-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-600" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-slate-900">{goal.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{goal.description}</p>

                  <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        <CalendarDays className="h-3 w-3" strokeWidth={2} />
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={goal.date}
                        onChange={(e) => updateGoal(goal.id, { date: e.target.value })}
                        className="w-full rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3 py-2 text-[12px] text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {quickPills.map((pill) => (
                          <button
                            key={pill}
                            type="button"
                            onClick={() => applyQuickPill(goal.id, pill)}
                            className="rounded-full border border-[#E4E8EC] bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 transition-all hover:border-emerald-400 hover:text-emerald-600"
                          >
                            {pill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Priority
                      </label>
                      <div className="flex gap-1.5">
                        {priorities.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => updateGoal(goal.id, { priority: p.id })}
                            className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition-all ${
                              goal.priority === p.id
                                ? `${p.bg} ${p.color} ${p.border}`
                                : "border-[#E4E8EC] bg-white text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {p.id}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Pace
                        </span>
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5">
                          <Zap className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
                          <span className="text-[11px] font-semibold text-emerald-700">{goal.pace}m/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-7 flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-xl border border-[#E4E8EC] bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
            Back
          </button>
          <button
            type="button"
            disabled={researching}
            onClick={handleLaunch}
            className="flex items-center gap-2 rounded-xl bg-[#15C39A] px-5 py-2.5 text-[13px] font-semibold text-[#0F1F1C] transition-all hover:bg-[#11A683] hover:shadow-[0_0_24px_rgba(21,194,154,0.3)] disabled:opacity-60"
          >
            {researching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-[#0F1F1C]/30 border-t-[#0F1F1C]"
                />
                Researching with Tavily...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" strokeWidth={2.5} />
                Research with Tavily &amp; Launch OS
              </>
            )}
          </button>
        </div>
        {cap && (
          <p className="text-[11px] text-slate-400">
            {cap.minutes}m capacity · {goals.length} goals · {cap.modules} deep-work modules
          </p>
        )}
      </motion.div>

      {researching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1F1C]/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4 rounded-2xl bg-white px-10 py-8 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 rounded-full border-[3px] border-emerald-100 border-t-emerald-600"
            />
            <p className="text-[14px] font-bold text-slate-900">Researching with Tavily</p>
            <p className="text-[11px] text-slate-500">
              Decomposing syllabi, fetching web sources, building your roadmap...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
