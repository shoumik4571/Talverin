import { useEffect, useState } from "react";
import { Cpu, Sparkles } from "lucide-react";

interface Props {
  viewLabel: string;
}

export const TopWindowBar = ({ viewLabel }: Props) => {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setClock(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-[#E4E8EC] bg-white/90 px-5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-3 text-[12px] font-semibold text-slate-700">{viewLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-medium tabular-nums text-slate-400">{clock}</span>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
          <Sparkles className="h-3 w-3 text-emerald-600" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-emerald-700">NVIDIA Nemotron</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1">
          <Cpu className="h-3 w-3 text-sky-600" strokeWidth={2} />
          <span className="text-[10px] font-semibold text-sky-700">Tavily Active</span>
        </div>
      </div>
    </div>
  );
};
