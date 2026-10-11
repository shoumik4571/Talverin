import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

type SummaryItem = {
  label: string;
  value: string;
  description: string;
  icon: string;
  alt: string;
};

type ScheduleItem = {
  title: string;
  time: string;
  detail?: string;
  top: string;
  height: string;
  background: string;
  border: string;
  text?: string;
  muted?: string;
};

type Goal = {
  icon: string;
  alt: string;
  title: string;
  description: string;
  metadata: string;
};

const summaryItems: SummaryItem[] = [
  {
    label: "Deep-work capacity",
    value: "360 min",
    description: "4 × 90-minute modules",
    icon: "/icon-1.svg",
    alt: "Icon",
  },
  {
    label: "Active goals",
    value: "04",
    description: "One meaningful step each",
    icon: "/target.svg",
    alt: "Target",
  },
  {
    label: "Daily rhythm",
    value: "07–23",
    description: "16h • routines protected",
    icon: "/sun.svg",
    alt: "Sun",
  },
  {
    label: "Next milestone",
    value: "5 days",
    description: "Rust CLI · Oct 16",
    icon: "/flag.svg",
    alt: "Flag",
  },
];

const scheduleItems: ScheduleItem[] = [
  {
    title: "Breakfast",
    time: "07:00–07:30",
    top: "top-[2px]",
    height: "h-[26px]",
    background: "bg-[#f0f7f4]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Morning preparation",
    time: "07:30–08:00",
    top: "top-[32px]",
    height: "h-[26px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Scalability & load balancing",
    time: "08:00–09:30",
    detail: "System design interview · 90 min · High",
    top: "top-[62px]",
    height: "h-[86px]",
    background: "bg-indigo-600",
    border: "border-[#e5eaf2]",
    text: "text-white",
    muted: "text-[#e2e3ff]",
  },
  {
    title: "Fixed office hours",
    time: "09:30–12:30",
    detail: "09:30–12:30 · protected · outside goal capacity",
    top: "top-[152px]",
    height: "h-44",
    background: "bg-[#edf1f6]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Lunch",
    time: "12:30–13:00",
    top: "top-[332px]",
    height: "h-[26px]",
    background: "bg-[#f0f7f4]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Generics & type inference",
    time: "13:00–14:30",
    detail: "Advanced TypeScript · 90 min · High",
    top: "top-[362px]",
    height: "h-[86px]",
    background: "bg-[#eef0ff]",
    border: "border-[#daddfd]",
  },
  {
    title: "Reset & walk",
    time: "14:30–15:00",
    top: "top-[452px]",
    height: "h-[26px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Ownership & CLI scaffolding",
    time: "15:00–16:30",
    detail: "Build a Rust CLI · 90 min · Medium",
    top: "top-[482px]",
    height: "h-[86px]",
    background: "bg-[#eef0ff]",
    border: "border-[#daddfd]",
  },
  {
    title: "Admin & inbox",
    time: "16:30–17:00",
    top: "top-[572px]",
    height: "h-[26px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Gym",
    time: "17:00–18:00",
    detail: "17:00–18:00 · strength & movement",
    top: "top-[602px]",
    height: "h-14",
    background: "bg-[#f0f7f4]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Recovery & shower",
    time: "18:00–18:30",
    top: "top-[662px]",
    height: "h-[26px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Case-study architecture",
    time: "18:30–20:00",
    detail: "Ship portfolio v2 · 90 min · Normal",
    top: "top-[692px]",
    height: "h-[86px]",
    background: "bg-[#eef0ff]",
    border: "border-[#daddfd]",
  },
  {
    title: "Dinner",
    time: "20:00–20:45",
    detail: "20:00–20:45 · unplug",
    top: "top-[782px]",
    height: "h-[41px]",
    background: "bg-[#f0f7f4]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Unscheduled breathing room",
    time: "20:45–21:00",
    top: "top-[827px]",
    height: "h-[11px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Night Review",
    time: "21:00–21:30",
    top: "top-[842px]",
    height: "h-[26px]",
    background: "bg-[#f0f7f4]",
    border: "border-[#e5eaf2]",
  },
  {
    title: "Wind down & personal time",
    time: "21:30–23:00",
    detail: "21:30–23:00 · sleep at 23:00",
    top: "top-[872px]",
    height: "h-[86px]",
    background: "bg-[#f8fafd]",
    border: "border-[#e5eaf2]",
  },
];

const goals: Goal[] = [
  {
    icon: "/network-1.svg",
    alt: "Network",
    title: "System design interview",
    description: "Design a resilient URL shortener",
    metadata: "2026-10-25 · High · 90m / day",
  },
  {
    icon: "/code-2.svg",
    alt: "Code",
    title: "Advanced TypeScript",
    description: "Build a type-safe API client",
    metadata: "2026-10-21 · High · 90m / day",
  },
  {
    icon: "/terminal.svg",
    alt: "Terminal",
    title: "Build a Rust CLI",
    description: "Create a working clap command",
    metadata: "2026-10-16 · Medium · 90m / day",
  },
  {
    icon: "/panels-top-left.svg",
    alt: "Panels top left",
    title: "Ship portfolio v2",
    description: "Outline one end-to-end project story",
    metadata: "2026-11-10 · Normal · 90m / day",
  },
];

const hours = Array.from(
  { length: 17 },
  (_, index) => `${String(index + 7).padStart(2, "0")}:00`,
);

const cardClass =
  "rounded-[20px] border border-[#e5eaf2] bg-white shadow-[0px_4px_16px_#24345b05]";

const textClass = "[font-family:'Inter',Helvetica]";

export const DailyPlanningDashboardSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState("today");
  const [alarmOpen, setAlarmOpen] = useState(true);

  return (
    <section className="relative flex min-w-0 flex-1 flex-col gap-6 overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-col gap-[5px]">
          <p className={`${textClass} text-xs leading-[17.4px] text-slate-500`}>
            SUNDAY, OCTOBER 11, 2026
          </p>
          <h1
            className={`${textClass} text-[32px] font-normal leading-[46.4px] text-slate-900`}
          >
            Your day, in harmony.
          </h1>
          <p className={`${textClass} text-sm leading-[20.3px] text-slate-500`}>
            Good morning, Alex. Make space for what moves you forward.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-12 rounded-full bg-white px-4 font-m3-label-large text-sm font-medium text-slate-900"
        >
          Laptop alarm
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <Card key={item.label} className={cardClass}>
            <CardContent className="flex min-h-[155px] flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <p
                  className={`${textClass} text-xs leading-[17.4px] text-slate-500`}
                >
                  {item.label}
                </p>
                <img
                  className="h-[18px] w-[18px]"
                  src={item.icon}
                  alt={item.alt}
                />
              </div>
              <p
                className={`${textClass} text-[28px] leading-[40.6px] text-slate-900`}
              >
                {item.value}
              </p>
              <p
                className={`${textClass} text-[11px] leading-[15.9px] text-slate-500`}
              >
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-[14px] border border-[#e5eaf2] bg-white p-1.5">
          <TabsTrigger
            value="today"
            className="rounded-[10px] px-5 py-2.5 text-[13px] font-medium text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="rounded-[10px] px-5 py-2.5 text-[13px] font-medium text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            Tavily Goal Analysis
          </TabsTrigger>
          <TabsTrigger
            value="roadmap"
            className="rounded-[10px] px-5 py-2.5 text-[13px] font-medium text-slate-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            7-Day Roadmap
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <Card className={cardClass}>
          <CardContent className="min-w-0 overflow-x-auto p-6">
            <div className="flex min-w-[706px] flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className={`${textClass} text-xl leading-[29px] text-slate-900`}
                  >
                    Today&apos;s composition
                  </h2>
                  <p
                    className={`${textClass} text-xs leading-[17.4px] text-slate-500`}
                  >
                    07:00–23:00 · every hour has its place
                  </p>
                </div>
                <span
                  className={`${textClass} text-xs leading-[17.4px] text-indigo-600`}
                >
                  360 / 360m planned
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`${textClass} text-[11px] leading-[15.9px] text-indigo-600`}
                >
                  ● Deep work
                </span>
                <span
                  className={`${textClass} text-[11px] leading-[15.9px] text-slate-500`}
                >
                  ● Fixed hours
                </span>
                <span
                  className={`${textClass} text-[11px] leading-[15.9px] text-[#15836b]`}
                >
                  ● Habits &amp; life
                </span>
              </div>
              <div className="relative h-[1000px] w-[706px]">
                <div className="absolute left-[54px] top-[68px] flex w-[652px] items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f5b76c]" />
                  <span className="h-px flex-1 bg-[#f5b76c]" />
                </div>
                {scheduleItems.map((item) => (
                  <div
                    key={item.title}
                    className={`absolute left-16 flex w-[642px] flex-col gap-[3px] rounded-lg border px-3.5 py-2.5 ${item.top} ${item.height} ${item.background} ${item.border}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className={`${textClass} truncate text-xs leading-[17.4px] ${item.text ?? "text-slate-900"}`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`${textClass} shrink-0 text-[10px] leading-[14.5px] ${item.muted ?? "text-slate-500"}`}
                      >
                        {item.time}
                      </span>
                    </div>
                    {item.detail && (
                      <span
                        className={`${textClass} text-[11px] leading-[15.9px] ${item.muted ?? "text-slate-500"}`}
                      >
                        {item.detail}
                      </span>
                    )}
                    {item.title === "Scalability & load balancing" && (
                      <span
                        className={`${textClass} text-[10px] leading-[14.5px] text-white`}
                      >
                        ● IN FOCUS · STARTED AT 08:00
                      </span>
                    )}
                  </div>
                ))}

                {hours.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute left-0 flex w-[706px] items-center gap-4"
                    style={{ top: `${index * 60}px` }}
                  >
                    <span
                      className={`${textClass} w-[42px] text-[11px] leading-[15.9px] text-slate-400`}
                    >
                      {hour}
                    </span>
                    <span className="h-px flex-1 bg-[#e5eaf2]" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <aside className="flex flex-col gap-5">
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-2.5">
                <img
                  className="h-[22px] w-[22px]"
                  src="/sparkles.svg"
                  alt="Sparkles"
                />
                <h2
                  className={`${textClass} text-lg leading-[26.1px] text-slate-900`}
                >
                  Your daily brief
                </h2>
              </div>
              <p
                className={`${textClass} text-sm leading-[20.3px] text-slate-900`}
              >
                Depth before speed.
              </p>
              <p
                className={`${textClass} text-[13px] leading-[18.8px] text-slate-500`}
              >
                Your system-design session comes first, while your mind is
                fresh. Keep each module to one tangible outcome.
              </p>
              <p
                className={`${textClass} text-[11px] leading-[15.9px] text-indigo-600`}
              >
                NVIDIA Nemotron-3.5-Lightning
              </p>
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-4 p-6">
              <h2
                className={`${textClass} text-lg leading-[26.1px] text-slate-900`}
              >
                Four goals, one clear day.
              </h2>
              {goals.map((goal) => (
                <div key={goal.title} className="flex flex-col gap-[7px] py-2">
                  <div className="flex items-start gap-2.5">
                    <img
                      className="h-[18px] w-[18px]"
                      src={goal.icon}
                      alt={goal.alt}
                    />
                    <p
                      className={`${textClass} flex-1 text-sm leading-[20.3px] text-slate-900`}
                    >
                      {goal.title}
                    </p>
                  </div>
                  <p
                    className={`${textClass} text-xs leading-[17.4px] text-slate-500`}
                  >
                    {goal.description}
                  </p>
                  <p
                    className={`${textClass} text-[11px] leading-[15.9px] text-indigo-600`}
                  >
                    {goal.metadata}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className={cardClass}>
            <CardContent className="flex flex-col gap-4 p-6">
              <img className="h-[22px] w-[22px]" src="/icon-2.svg" alt="Icon" />
              <h2
                className={`${textClass} text-[17px] leading-[24.6px] text-slate-900`}
              >
                Capacity is not your whole day.
              </h2>
              <p
                className={`${textClass} text-xs leading-[17.4px] text-slate-500`}
              >
                3h office time, five habits and breathing room are already
                accounted for. Nothing overlaps.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
      {alarmOpen && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4">
          <Card className="pointer-events-auto w-full max-w-[290px] overflow-hidden rounded-[20px] border-[#e5eaf2] bg-white shadow-[0px_12px_40px_#24345b25]">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">♧</span>
                  <h2 className={`${textClass} text-base text-slate-900`}>
                    Laptop Alarm
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setAlarmOpen(false)}
                  aria-label="Close laptop alarm"
                >
                  <XIcon className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
              <div className="flex h-16 items-center justify-center gap-1.5">
                {[18, 30, 45, 58, 45, 30, 18].map((height, index) => (
                  <span
                    key={index}
                    className="w-1.5 rounded-full bg-indigo-600"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>
              <div className="rounded-[18px] border border-[#e5eaf2] bg-white p-3 shadow-[0px_6px_18px_#24345b18]">
                <p
                  className={`${textClass} text-[11px] font-semibold text-slate-900`}
                >
                  A gentle return to focus.
                </p>
                <p
                  className={`${textClass} mt-2 text-[11px] leading-[15px] text-slate-900`}
                >
                  Preview your laptop&apos;s sound before your next session.
                  Keep this tab open and your laptop awake.
                </p>
                <Button
                  type="button"
                  className="mt-3 h-auto w-full rounded-full bg-indigo-600 py-2 text-[9px] text-white hover:bg-indigo-700"
                >
                  Ring Laptop Alarm
                </Button>
                <p
                  className={`${textClass} mt-2 text-[7px] uppercase text-slate-400`}
                >
                  Sound preview · daylight chime · 5 seconds
                </p>
              </div>
              <div className="border-t border-[#e5eaf2] pt-3">
                <p className={`${textClass} text-[9px] text-slate-400`}>
                  ▫ Laptop speakers · volume 70%
                </p>
                <p className={`${textClass} text-[8px] text-slate-400`}>
                  Your focus session continues behind this dialog.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
};
