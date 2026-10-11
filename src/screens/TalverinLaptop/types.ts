import {
  GraduationCap,
  Code2,
  TrendingUp,
  Rocket,
  Microscope,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type RoleId =
  | "university-student"
  | "software-engineer"
  | "business-finance"
  | "startup-founder"
  | "exam-research"
  | "creator";

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export type CapacityId = "1-2h" | "3-4h" | "5-6h" | "7-8h";

export interface Capacity {
  id: CapacityId;
  label: string;
  minutes: number;
  modules: number;
  moduleLength: number;
}

export interface Habit {
  id: string;
  label: string;
  time: string;
  duration: number;
}

export type Priority = "High" | "Medium" | "Normal";

export interface Goal {
  id: string;
  title: string;
  description: string;
  iconName: string;
  date: string;
  priority: Priority;
  pace: number;
  custom?: boolean;
  source?: string;
}

export interface Profile {
  name: string;
  focusNote: string;
  role: RoleId | null;
}

export interface Routine {
  capacity: CapacityId | null;
  wakeTime: string;
  sleepTime: string;
  fixedHours: boolean;
  habits: string[];
}

export interface TavilyModule {
  title: string;
  description: string;
  sources: { title: string; url: string }[];
}

export interface RoadmapDay {
  date: string;
  dayLabel: string;
  tasks: { goal: string; task: string; minutes: number }[];
}

export type Step = 0 | 1 | 2 | 3 | 4;

export type NavView = Step | "schedule" | "syllabus" | "roadmap" | "engine";

export const roles: Role[] = [
  {
    id: "university-student",
    label: "University Student",
    description: "Balance coursework, assignments, and exam prep",
    icon: GraduationCap,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    id: "software-engineer",
    label: "Software Engineer",
    description: "Sharpen system design, master new languages",
    icon: Code2,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
  },
  {
    id: "business-finance",
    label: "Business / Finance",
    description: "Master modeling, strategy, and case interviews",
    icon: TrendingUp,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
  {
    id: "startup-founder",
    label: "Startup Founder",
    description: "Build MVP, fundraise, and grow your venture",
    icon: Rocket,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    id: "exam-research",
    label: "Exam / Research Aspirant",
    description: "Crack competitive exams and research papers",
    icon: Microscope,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    id: "creator",
    label: "Creator",
    description: "Produce content, build audience, launch products",
    icon: Palette,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50",
  },
];
