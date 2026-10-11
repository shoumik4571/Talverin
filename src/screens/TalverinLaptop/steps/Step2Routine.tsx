import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, Sun, Moon, Briefcase, Check } from "lucide-react";
import { capacities, habitPills } from "../data";
import type { Routine, CapacityId } from "../types";

interface Props {
  routine: Routine;
  setRoutine: (r: Routine) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const Step2Routine = ({ routine, setRoutine, onContinue, onBack }: Props) => {
  const toggleHabit = (id: string) => {
    const has = routine.habits.includes(id);
    setRoutine({
      ...routine,
      habits: has ? routine.habits.filter((h) => h !== id) : [...routine.habits, id],
    });
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
          Your full-day rhythm
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          How much deep work can you sustain? When does your day start and end?
        </p>
      </motion.div>

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Daily Goal — Deep-Work Capacity
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {capacities.map((cap, i) => {
          const selected = routine.capacity === cap.id;
          return (
            <motion.button
              key={cap.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => setRoutine({ ...routine, capacity: cap.id as CapacityId })}
              className={`relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                selected
                  ? "border-[#15C39A] bg-[#0F1F1C] text-white ring-2 ring-[#15C39A] shadow-[0_0_24px_rgba(21,194,154,0.25)]"
                  : "border-[#E4E8EC] bg-white text-slate-900 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              }`}
            >
              <span className="text-[20px] font-bold leading-none">{cap.minutes}m</span>
              <span className="text-[12px] font-semibold">{cap.label}</span>
              <span className={`text-[10px] ${selected ? "text-[#15C39A]" : "text-slate-400"}`}>
                {cap.modules} × {cap.moduleLength}m modules
              </span>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#15C39A]"
                >
                  <Check className="h-3 w-3 text-[#0F1F1C]" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mt-5 grid gap-3 sm:grid-cols-2"
      >
        <div className="rounded-xl border border-[#E4E8EC] bg-white p-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <Sun className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
            Wake Time
          </label>
          <input
            type="time"
            value={routine.wakeTime}
            onChange={(e) => setRoutine({ ...routine, wakeTime: e.target.value })}
            className="w-full rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3 py-2.5 text-[13px] text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="rounded-xl border border-[#E4E8EC] bg-white p-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <Moon className="h-3.5 w-3.5 text-indigo-500" strokeWidth={2} />
            Sleep Time
          </label>
          <input
            type="time"
            value={routine.sleepTime}
            onChange={(e) => setRoutine({ ...routine, sleepTime: e.target.value })}
            className="w-full rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3 py-2.5 text-[13px] text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mt-5 flex items-center justify-between rounded-xl border border-[#E4E8EC] bg-white p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Briefcase className="h-4.5 w-4.5 text-slate-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900">Fixed Lectures / Office Hours</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Block out non-goal time (09:30–12:30)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRoutine({ ...routine, fixedHours: !routine.fixedHours })}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            routine.fixedHours ? "bg-[#15C39A]" : "bg-slate-200"
          }`}
        >
          <motion.div
            animate={{ x: routine.fixedHours ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
          />
        </button>
      </motion.div>

      <p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Daily Habits &amp; Life
      </p>

      <div className="flex flex-wrap gap-2">
        {habitPills.map((habit, i) => {
          const selected = routine.habits.includes(habit.id);
          return (
            <motion.button
              key={habit.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium transition-all ${
                selected
                  ? "border-[#15C39A] bg-[#0F1F1C] text-white ring-2 ring-[#15C39A]"
                  : "border-[#E4E8EC] bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {selected && <Check className="h-3 w-3 text-[#15C39A]" strokeWidth={3} />}
              <span>{habit.label}</span>
              <span className={`text-[10px] ${selected ? "text-[#15C39A]" : "text-slate-400"}`}>
                {habit.time}
              </span>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
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
          disabled={!routine.capacity}
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
