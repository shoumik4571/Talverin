import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Search, Sparkles, X } from "lucide-react";
import { aiSuggestionTemplates, goalLibrary, getGoalIcon, roles } from "../data";
import type { Goal, Profile } from "../types";

interface Props {
  profile: Profile;
  goals: Goal[];
  setGoals: (g: Goal[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

const goalIconNames = [
  "target", "bar-chart-3", "terminal", "layout-template",
  "microscope", "rocket", "file-text", "pen-line",
];

export const Step3GoalStudio = ({ profile, goals, setGoals, onContinue, onBack }: Props) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const role = roles.find((r) => r.id === profile.role);
  const library = profile.role ? goalLibrary[profile.role] : [];
  const suggestions = query.trim() ? aiSuggestionTemplates(query.trim()) : [];

  const addGoal = (title: string, description: string, custom: boolean) => {
    const id = `goal-${Date.now()}-${goals.length}`;
    const iconName = custom ? "target" : goalIconNames[goals.length % goalIconNames.length];
    const today = new Date("2026-10-11");
    today.setDate(today.getDate() + 14);
    const defaultDate = today.toISOString().slice(0, 10);
    const newGoal: Goal = {
      id,
      title,
      description,
      iconName,
      date: defaultDate,
      priority: "Medium",
      pace: 90,
      custom,
    };
    setGoals([...goals, newGoal]);
    setQuery("");
    setShowDropdown(false);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
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
          AI Goal Studio
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          {role ? `Tailored for ${role.label}. ` : ""}Search anything or pick from the library.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="relative mb-5"
      >
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search or type any goal — e.g. 'Learn Rust ownership'"
            className="w-full rounded-xl border border-[#E4E8EC] bg-white py-3 pl-11 pr-4 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <AnimatePresence>
          {showDropdown && query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#E4E8EC] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
            >
              <button
                type="button"
                onMouseDown={() => addGoal(query.trim(), "Custom goal added by you", true)}
                className="flex w-full items-center gap-3 border-b border-[#E4E8EC] bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#15C39A]">
                  <Plus className="h-4 w-4 text-[#0F1F1C]" strokeWidth={2.5} />
                </div>
                <span className="text-[12px] font-semibold text-emerald-900">
                  Add Exact Custom Goal: <span className="font-bold">&ldquo;{query.trim()}&rdquo;</span>
                </span>
              </button>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => addGoal(s, `AI-suggested variation of: ${query.trim()}`, false)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" strokeWidth={2} />
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-slate-900">{s}</span>
                    <span className="text-[10px] text-slate-400">AI-suggested variation</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Selected goals */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5 flex flex-wrap gap-2"
        >
          {goals.map((g) => {
            const Icon = getGoalIcon(g.iconName);
            return (
              <motion.div
                key={g.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex items-center gap-2 rounded-full border border-[#15C39A]/30 bg-[#15C39A]/10 py-1.5 pl-2.5 pr-1.5 text-[12px] font-medium text-emerald-900"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
                <span>{g.title}</span>
                <button
                  type="button"
                  onClick={() => removeGoal(g.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-200 hover:text-emerald-700"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Library */}
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {role ? `${role.label} Goal Library` : "Goal Library"}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {library.map((item, i) => {
          const alreadyAdded = goals.some((g) => g.title === item.title);
          const Icon = getGoalIcon(item.iconName);
          return (
            <motion.button
              key={item.title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ y: -3 }}
              disabled={alreadyAdded}
              onClick={() => addGoal(item.title, item.description, false)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                alreadyAdded
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-[#E4E8EC] bg-white hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-4.5 w-4.5 text-slate-600" strokeWidth={2} />
                </div>
                {alreadyAdded && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    Added
                  </span>
                )}
              </div>
              <span className="text-[13px] font-semibold text-slate-900">{item.title}</span>
              <span className="text-[11px] leading-relaxed text-slate-500">{item.description}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-7 flex items-center justify-center gap-3"
      >
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
          disabled={goals.length === 0}
          onClick={onContinue}
          className="flex items-center gap-2 rounded-xl bg-[#15C39A] px-6 py-2.5 text-[13px] font-semibold text-[#0F1F1C] transition-all hover:bg-[#11A683] hover:shadow-[0_0_24px_rgba(21,194,154,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </motion.div>
    </div>
  );
};
