import {
  Target,
  SquareStack,
  Terminal,
  LayoutTemplate,
  BarChart3,
  FileText,
  Microscope,
  TrendingUp,
  Rocket,
  PenLine,
  GraduationCap,
  Code2,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { Capacity, Habit, Role, TavilyModule, RoadmapDay } from "./types";
import { roles } from "./types";

export { roles };

export const capacities: Capacity[] = [
  { id: "1-2h", label: "1–2 hours", minutes: 120, modules: 1, moduleLength: 120 },
  { id: "3-4h", label: "3–4 hours", minutes: 240, modules: 2, moduleLength: 120 },
  { id: "5-6h", label: "5–6 hours", minutes: 360, modules: 4, moduleLength: 90 },
  { id: "7-8h", label: "7–8 hours", minutes: 450, modules: 5, moduleLength: 90 },
];

export const habitPills: Habit[] = [
  { id: "breakfast", label: "Breakfast", time: "07:00", duration: 30 },
  { id: "lunch", label: "Lunch", time: "12:30", duration: 30 },
  { id: "gym", label: "Gym", time: "17:00", duration: 60 },
  { id: "dinner", label: "Dinner", time: "20:00", duration: 45 },
  { id: "night-review", label: "Night Review", time: "21:00", duration: 30 },
];

export const goalLibrary: Record<string, { title: string; description: string; iconName: string }[]> = {
  "university-student": [
    { title: "Data Structures & Algorithms", description: "Master trees, graphs, dynamic programming", iconName: "square-stack" },
    { title: "Linear Algebra Exam", description: "Eigenvalues, SVD, matrix decompositions", iconName: "bar-chart-3" },
    { title: "Research Paper Writing", description: "Draft and submit to a top venue", iconName: "file-text" },
    { title: "Operating Systems Project", description: "Build a simple shell and scheduler", iconName: "terminal" },
  ],
  "software-engineer": [
    { title: "System Design Interview", description: "Design a resilient URL shortener", iconName: "layout-template" },
    { title: "Advanced TypeScript", description: "Build a type-safe API client", iconName: "code-2" },
    { title: "Build a Rust CLI", description: "Create a working clap command", iconName: "terminal" },
    { title: "Ship Portfolio v2", description: "Outline one end-to-end project story", iconName: "layout-template" },
  ],
  "business-finance": [
    { title: "Financial Modeling", description: "Build a 3-statement LBO model", iconName: "trending-up" },
    { title: "Case Interview Prep", description: "Practice 20 McKinsey-style cases", iconName: "target" },
    { title: "Market Research Report", description: "Analyze SaaS TAM for a vertical", iconName: "bar-chart-3" },
    { title: "Excel VBA Automation", description: "Automate monthly reporting pipeline", iconName: "file-text" },
  ],
  "startup-founder": [
    { title: "MVP Launch", description: "Ship a landing page + waitlist in 5 days", iconName: "rocket" },
    { title: "Pitch Deck", description: "Craft a 10-slide YC-style deck", iconName: "layout-template" },
    { title: "Customer Discovery", description: "Interview 30 potential users", iconName: "target" },
    { title: "Fundraising Tracker", description: "Build and maintain an investor CRM", iconName: "trending-up" },
  ],
  "exam-research": [
    { title: "GRE Quant Mastery", description: "Score 168+ on quantitative reasoning", iconName: "target" },
    { title: "Research Methodology", description: "Complete a literature review", iconName: "microscope" },
    { title: "Statistical Inference", description: "Master hypothesis testing and CI", iconName: "bar-chart-3" },
    { title: "Academic Writing", description: "Write a 5,000-word paper draft", iconName: "pen-line" },
  ],
  "creator": [
    { title: "YouTube Channel Launch", description: "Publish first 3 videos", iconName: "layout-template" },
    { title: "Newsletter Growth", description: "Reach 1,000 subscribers", iconName: "file-text" },
    { title: "Brand Collab Pitch", description: "Land first sponsored deal", iconName: "trending-up" },
    { title: "Content Calendar System", description: "Build a 30-day content pipeline", iconName: "pen-line" },
  ],
};

export const goalIconMap: Record<string, LucideIcon> = {
  "square-stack": SquareStack,
  "bar-chart-3": BarChart3,
  "file-text": FileText,
  "terminal": Terminal,
  "layout-template": LayoutTemplate,
  "code-2": Code2,
  "target": Target,
  "trending-up": TrendingUp,
  "rocket": Rocket,
  "microscope": Microscope,
  "pen-line": PenLine,
  "graduation-cap": GraduationCap,
  "palette": Palette,
};

export function getGoalIcon(name: string): LucideIcon {
  return goalIconMap[name] ?? Target;
}

export const aiSuggestionTemplates: ((q: string) => string[]) = (q: string) => [
  `${q} — fundamentals first`,
  `${q} — advanced project-based`,
  `${q} — interview-ready in 30 days`,
  `${q} — daily practice drills`,
];

export const tavilyModules: (goals: { title: string; description: string }[]) => TavilyModule[] = (goals) =>
  goals.map((g) => ({
    title: g.title,
    description: `Decomposed syllabus for: ${g.description}`,
    sources: [
      { title: `${g.title} — Official Documentation`, url: "https://example.com/docs" },
      { title: `${g.title} — Community Guide`, url: "https://example.com/guide" },
      { title: `${g.title} — Video Course`, url: "https://example.com/course" },
    ],
  }));

export function generateRoadmap(
  goals: { title: string; date: string }[],
  dailyMinutes: number,
): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  const today = new Date("2026-10-11");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const perGoal = Math.floor(dailyMinutes / Math.max(goals.length, 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      dayLabel: `${dayNames[d.getDay()]} ${d.getDate()}`,
      tasks: goals.map((g) => ({
        goal: g.title,
        task: i === 0 ? "Foundation & setup" : i === 6 ? "Review & integration" : `Module ${i} practice`,
        minutes: perGoal,
      })),
    });
  }
  return days;
}
