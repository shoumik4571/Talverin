import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, Cpu, Sparkles } from "lucide-react";
import { roles } from "../data";
import type { Profile, RoleId } from "../types";

interface Props {
  profile: Profile;
  setProfile: (p: Profile) => void;
  onContinue: () => void;
}

export const Step1Profile = ({ profile, setProfile, onContinue }: Props) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleContinue = () => {
    if (!profile.name.trim() || !profile.role) return;
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
      onContinue();
    }, 2000);
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <h1 className="text-[24px] font-bold leading-tight text-slate-900">
          Let&apos;s personalize your OS
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Tell us who you are. TALVERIN will tailor every goal, schedule, and insight to your path.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mb-5 grid gap-3 sm:grid-cols-2"
      >
        <div className="rounded-xl border border-[#E4E8EC] bg-white p-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Your Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="e.g. Alex Rivera"
            className="w-full rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="rounded-xl border border-[#E4E8EC] bg-white p-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Focus Note (optional)
          </label>
          <input
            type="text"
            value={profile.focusNote}
            onChange={(e) => setProfile({ ...profile, focusNote: e.target.value })}
            placeholder="What matters most right now?"
            className="w-full rounded-lg border border-[#E4E8EC] bg-[#F5F7F9] px-3 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </motion.div>

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Select Your Role
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, i) => {
          const selected = profile.role === role.id;
          const Icon = role.icon;
          return (
            <motion.button
              key={role.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => setProfile({ ...profile, role: role.id as RoleId })}
              className={`relative flex flex-col items-start gap-2.5 rounded-xl border p-4 text-left transition-all ${
                selected
                  ? "border-[#15C39A] bg-[#0F1F1C] text-white ring-2 ring-[#15C39A] shadow-[0_0_24px_rgba(21,194,154,0.25)]"
                  : "border-[#E4E8EC] bg-white text-slate-900 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-[#15C39A]" : role.iconBg}`}
              >
                <Icon
                  className={`h-5 w-5 ${selected ? "text-[#0F1F1C]" : role.iconColor}`}
                  strokeWidth={2}
                />
              </div>
              <span className="text-[13px] font-semibold">{role.label}</span>
              <span className={`text-[11px] leading-relaxed ${selected ? "text-white/60" : "text-slate-500"}`}>
                {role.description}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-7 flex justify-center"
      >
        <button
          type="button"
          disabled={!profile.name.trim() || !profile.role}
          onClick={handleContinue}
          className="flex items-center gap-2 rounded-xl bg-[#15C39A] px-7 py-2.5 text-[13px] font-semibold text-[#0F1F1C] transition-all hover:bg-[#11A683] hover:shadow-[0_0_24px_rgba(21,194,154,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </motion.div>

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1F1C]/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-8 shadow-2xl"
            >
              <div className="relative flex h-16 w-16 items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-3 border-emerald-100 border-t-emerald-600"
                  style={{ borderWidth: "3px" }}
                />
                <Cpu className="h-6 w-6 text-emerald-600" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-slate-900">AI Neural Personalization</p>
                <p className="mt-0.5 text-[11px] text-slate-500">NVIDIA Nemotron-3.5-Lightning</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {["Analyzing role profile", "Mapping cognitive patterns", "Building goal templates"].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.5 }}
                    className="flex items-center gap-2 text-[11px] text-slate-600"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.5 }}
                      className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                    />
                    {text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
