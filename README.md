# Talverin — Personal AI Assistant

**Talverin** is a local-first, always-on Personal AI Assistant that doesn't just chat—it **actually controls your app**. Built for the **NVIDIA x Nebius Global AI Hackathon** (Personal AI Track).

## 🎯 What It Does
Talverin lives in your menubar/desktop and manages your entire day:
- **📅 Schedule Management** — Add, move, complete, rename time blocks via natural language
- **🎯 Goal Management** — Add goals, auto-generates syllabus via Tavily + NVIDIA Nemotron
- **🔔 Smart Alarms** — Native Electron window slides out even when app is minimized/backgrounded
- **📊 Day Briefings & Reports** — Auto-generated when day starts/ends
- **🤖 Full App Control** — Change settings, routines, themes, performance mode via chat
- **🖼️ Image/File Upload** — Drag & drop images/PDFs into chat for context

## 🏗️ Architecture
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + Framer Motion
- **Desktop**: Electron 30 (ARM64 macOS DMG)
- **AI**: NVIDIA Nemotron-3.5-Lightning via **Nebius Token Factory** API
- **Search**: Tavily Search API for real-time curriculum research
- **Persistence**: localStorage session restore + auto-save
- **Styling**: Tailwind CSS + custom design system (Sundrel/AdminCN themes)

## 🎮 Key Features
| Feature | Description |
|---------|-------------|
| **Natural Language Scheduling** | "Move my 2pm deep work to 4pm" → actually moves it |
| **Goal → Syllabus → Schedule** | "Learn Python" → Tavily researches → Nemotron builds 5-module syllabus → auto-scheduled |
| **Global Alarms** | Electron window slides from right edge even when app is minimized/other tab |
| **Day Briefing** | "You're 40% through your day, 3 sessions left" — auto-triggers |
| **Day Reports** | Auto-generates when all deep-work blocks complete |
| **7-Day Roadmap** | Visual goal progression with Tavily-researched modules |
| **Session Persistence** | Reload button + auto-save — never lose state |

## 🛠️ Tech Stack
- **NVIDIA Model**: Nemotron-3.5-Lightning (via Nebius Token Factory)
- **Search**: Tavily Search API
- **Runtime**: Next.js 15 + Electron 30 + React 19
- **Styling**: Tailwind CSS + custom design system (Sundrel/AdminCN/Aurora themes)
- **Animations**: Framer Motion + custom spring physics
- **Packaging**: electron-builder → macOS DMG (ARM64)

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Development (Next.js on :3000)
npm run dev

# Electron development
TALVERIN_DEV=1 npm run electron

# Build production DMG
npm run dist
# → ~/Documents/Talverin.dmg
```

## 📦 Installation
Download the latest DMG from [Releases](https://github.com/shoumik4571/Talverin/releases) and install:
1. Download `Talverin.dmg`
2. Right-click → Open (unsigned for hackathon)
3. Grant notification permissions
4. Complete onboarding

## 🎮 Demo Video
[3-minute demo on YouTube](https://youtube.com/your-demo-link)

## 🏗️ Built for NVIDIA × Nebius Global AI Hackathon 2026
- **Track**: Personal AI
- **NVIDIA Model**: Nemotron-3.5-Lightning (via Nebius Token Factory)
- **Nebius Services**: Token Factory Inference API
- **Feedback**: See [FEEDBACK.md](FEEDBACK.md)

---

**Built with ❤️ for the NVIDIA × Nebius Global AI Hackathon 2026** 🚀