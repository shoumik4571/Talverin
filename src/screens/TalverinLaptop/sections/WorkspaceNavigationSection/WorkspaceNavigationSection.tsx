import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

const workspaceItems = [
  { label: "Today", icon: "/sun.svg", alt: "Sun", active: true },
  {
    label: "Goal intelligence",
    icon: "/sparkles.svg",
    alt: "Sparkles",
    active: false,
  },
  {
    label: "Roadmap",
    icon: "/calendar-days.svg",
    alt: "Calendar days",
    active: false,
  },
  {
    label: "Laptop alarm",
    icon: "/alarm-clock.svg",
    alt: "Alarm clock",
    active: false,
  },
];

const goals = [
  {
    label: "System design interview",
    icon: "/network.svg",
    alt: "Network",
  },
  {
    label: "Advanced TypeScript",
    icon: "/code-2.svg",
    alt: "Code",
  },
  {
    label: "Build a Rust CLI",
    icon: "/terminal.svg",
    alt: "Terminal",
  },
  {
    label: "Ship portfolio v2",
    icon: "/panels-top-left.svg",
    alt: "Panels top left",
  },
];

export const WorkspaceNavigationSection = (): JSX.Element => {
  return (
    <nav
      aria-label="Workspace navigation"
      className="flex w-full max-w-[196px] flex-col items-start gap-7"
    >
      <h2 className="font-['Inter',Helvetica] text-[11px] font-normal leading-[15.9px] tracking-[0] text-slate-500">
        WORKSPACE
      </h2>
      <div className="flex w-full flex-col gap-3">
        {workspaceItems.map((item) => (
          <Button
            key={item.label}
            type="button"
            variant="ghost"
            aria-current={item.active ? "page" : undefined}
            className={`h-auto w-full justify-start gap-3 overflow-hidden rounded-xl p-3 font-['Inter',Helvetica] text-[13px] font-medium leading-[18.8px] tracking-[0] text-slate-900 ${
              item.active
                ? "bg-[#eef0ff] hover:bg-[#eef0ff]"
                : "bg-[#f6f8fc] hover:bg-[#eef0ff]"
            }`}
          >
            <img
              className="h-[18px] w-[18px] shrink-0"
              alt={item.alt}
              src={item.icon}
            />
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
      <div aria-hidden="true" className="h-px w-full bg-[#e5eaf2]" />
      <h2 className="font-['Inter',Helvetica] text-[11px] font-normal leading-[15.9px] tracking-[0] text-slate-500">
        YOUR GOALS
      </h2>
      <div className="flex w-full flex-col gap-3">
        {goals.map((goal) => (
          <Button
            key={goal.label}
            type="button"
            variant="ghost"
            className="h-auto w-full items-start justify-start gap-2.5 p-0 font-['Inter',Helvetica] text-left text-xs font-normal leading-[17.4px] tracking-[0] text-slate-900 hover:bg-transparent hover:text-slate-900"
          >
            <img
              className="mt-px h-4 w-4 shrink-0"
              alt={goal.alt}
              src={goal.icon}
            />
            <span className="flex-1">{goal.label}</span>
          </Button>
        ))}
      </div>
      <Card className="w-full overflow-hidden rounded-[20px] border-[#e5eaf2] bg-m-3white shadow-[0px_4px_16px_#24345b05]">
        <CardContent className="flex flex-col items-start gap-4 p-4">
          <p className="font-['Inter',Helvetica] text-xs font-normal leading-[17.4px] tracking-[0] text-slate-900">
            Software Engineer
          </p>
          <p className="font-['Inter',Helvetica] text-xs font-normal leading-[17.4px] tracking-[0] text-slate-500">
            6h deep work · 4 goals
            <br />
            07:00–23:00 day
          </p>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-['Inter',Helvetica] text-[11px] font-normal leading-[15.9px] tracking-[0] text-indigo-600"
          >
            Edit your setup ↗
          </Button>
        </CardContent>
      </Card>
    </nav>
  );
};
