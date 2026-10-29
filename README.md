# Talverin — Personal AI Assistant That Acts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![NVIDIA Nemotron](https://img.shields.io/badge/NVIDIA-Nemotron--3.5--Lightning-76B900?logo=nvidia)](https://www.nvidia.com/en-us/research/nemotron/)
[![Nebius Token Factory](https://img.shields.io/badge/Nebius-Token%20Factory-00D4AA)](https://nebius.com/token-factory)

**Talverin** is a local-first, always-on Personal AI Assistant that doesn't just chat—it **actually controls your app**. Built for the **NVIDIA × Nebius Global AI Hackathon** (Personal AI Track).

## 🎯 What It Does

Talverin lives in your menubar/desktop and manages your entire day:
- **📅 Schedule Management** — Add, move, complete, rename time blocks via natural language
- **🎯 Goal Management** — Add goals, auto-generates syllabus via Tavily + NVIDIA Nemotron
- **🔔 Smart Alarms** — Native Electron window slides out even when app is minimized/backgrounded
- **📊 Day Briefings & Reports** — Auto-generated when day starts/ends
- **🤖 Full App Control** — Change settings, routines, themes, performance mode via chat
- **🖼️ Image/File Upload** — Drag & drop images/PDFs into chat for context

## 🏗️ Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 + React 19 + Tailwind CSS + Framer Motion |
| **Desktop** | Electron 30 (ARM64 macOS DMG) |
| **AI Inference** | NVIDIA Nemotron-3.5-Lightning via **Nebius Token Factory** API |
| **Search** | Tavily Search API for real-time curriculum research |
| **Persistence** | localStorage session restore + auto-save |
| **Styling** | Tailwind CSS + custom design system (Sundrel/AdminCN/Aurora themes) |

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

## 🤖 NVIDIA Nemotron Usage

**Model**: **NVIDIA Nemotron-3.5-Lightning** via **Nebius Token Factory**

**Usage in Talverin**:

| Use Case | Implementation |
|----------|----------------|
| **Syllabus Synthesis** | Nemotron synthesizes 5-module curricula from Tavily research |
| **Schedule Operations** | Parses natural language → emits typed `scheduleOps` JSON |
| **Chat Reasoning** | Powers conversational scheduling, settings, goal management |

**Integration**: Via Nebius Token Factory OpenAI-compatible API (`/api/ai` route)

```typescript
// Example: scheduleOps emitted by Nemotron
{
  "op": "move",
  "find": "Python learning",
  "to": "16:00",
  "day": 0
}
```

## ⚡ Nebius Token Factory Integration

**Service**: Nebius Token Factory Inference API

**Acceleration Points**:

| Feature | Benefit |
|---------|---------|
| **Low-latency inference** | Sub-2s response for schedule ops |
| **OpenAI-compatible API** | Drop-in replacement for OpenAI SDK |
| **Structured Output** | Reliable JSON schema adherence for `scheduleOps` |
| **Cost-effective** | Generous free tier for hackathon development |

**Endpoints Used**:
- `chat/completions` (Nemotron-3.5-Lightning)
- Structured JSON output via `response_format: { type: "json_object" }`

## 🔍 Nebius Tools & Services Used

| Service | Purpose |
|---------|---------|
| **Token Factory** | Nemotron inference API |
| **Tavily Search API** | Live curriculum research for goals |

## 📦 Installation

Download the latest DMG from [Releases](https://github.com/shoumik4571/Talverin/releases) and install:

1. Download `Talverin.dmg`
2. Right-click → **Open** (unsigned for hackathon)
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

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for the NVIDIA × Nebius Global AI Hackathon 2026** 🚀