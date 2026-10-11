import { motion } from "framer-motion";

interface Props {
  step: number;
  onLogoClick: () => void;
}

const stepLabels = [
  "Profile",
  "Routine",
  "Goal Studio",
  "Calendar",
  "Dashboard",
];

export const ApplicationHeaderSection = ({ step, onLogoClick }: Props) => {
  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <button
        type="button"
        onClick={onLogoClick}
        className="flex items-center gap-2.5 focus:outline-none"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          T
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
          TALVERIN<span className="text-indigo-600"> OS</span>
        </span>
      </button>

      <nav className="hidden items-center gap-1 sm:flex">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: i === step ? "#4F46E5" : i < step ? "#e0e7ff" : "#f1f5f9",
                color: i === step ? "#ffffff" : i < step ? "#4F46E5" : "#94a3b8",
              }}
              className="flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px]">
                {i + 1}
              </span>
              {label}
            </motion.div>
            {i < stepLabels.length - 1 && (
              <div className={`mx-0.5 h-px w-4 ${i < step ? "bg-indigo-300" : "bg-slate-200"}`} />
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <span className="hidden sm:inline">NVIDIA Nemotron-3.5-Lightning</span>
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
    </header>
  );
};
