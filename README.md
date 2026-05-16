# 🎮 DC Game — Data Center Operator Simulator

An isometric pixel-art game where you play as a Data Center operator, learning real DCCA certification concepts through hands-on gameplay.

---

## 📚 Knowledge Source

> **All game rules, levels, mechanics, and educational content are derived from [`dc-study-app`](https://github.com/JesusOrellana/dc-study-app).**

This project is a **companion** to the DC Study App — it does not replace it. The study app is the source of truth for:
- Curriculum structure (courses → modules → concepts)
- Technical rules (AWG de-rating, bottleneck rule, SPOF mitigation, etc.)
- Question banks used for in-game challenges

**Rule:** Any new educational content added to `dc-study-app` should eventually become a new game level or mechanic in `dc-game`.

---

## 🗺 Level Map (Module → Game Level)

| Level | Source Module (dc-study-app) | Game Theme |
|-------|------------------------------|------------|
| Level 1 | Fundamentals of Cabling | Route cables, avoid EMI, size AWG gauges |
| Level 2 | Fundamentals of Availability | Build redundant power paths, eliminate SPOFs |
| Level 3 | Fire Protection Methods | Place detectors, configure EPO, manage suppressants |
| Level N | Future modules... | TBD |

---

## 🛠 Tech Stack

| Tool | Role |
|------|------|
| **Vite** | Build tool & dev server |
| **React 19** | UI shell (menus, HUD, overlays) |
| **Phaser 4** | Isometric game engine (scenes, tilemaps, sprites) |
| **TypeScript** | Type safety across game + UI |
| **pnpm** | Package manager |

---

## 🎮 Gameplay Concept

- **Genre**: Isometric pixel-art puzzle/simulation
- **Perspective**: Top-down isometric (bird's eye view)
- **Player role**: Data Center operator technician
- **Core loop**:
  1. Receive a task (e.g., "Cable rack #3 with proper AWG for 48A load")
  2. Interact with the DC environment to complete it
  3. Mistakes trigger educational feedback explaining the rule you broke
  4. Complete all tasks to unlock the next level

---

## 🏗 Project Structure

```
dc-game/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Game shell + UI routing
│   ├── game/
│   │   └── GameConfig.ts     # Phaser game configuration
│   ├── scenes/
│   │   ├── BootScene.ts      # Asset loading
│   │   ├── MenuScene.ts      # Main menu
│   │   ├── Level1Scene.ts    # Cabling module level
│   │   └── HUDScene.ts       # Always-on HUD overlay
│   ├── data/
│   │   └── levels.ts         # Level definitions (linked to dc-study-app modules)
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   └── ui/
│       └── GameContainer.tsx # React wrapper for Phaser canvas
└── public/
    └── assets/               # Tilemaps, spritesheets, audio
```

---

## 🚀 Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔗 Relationship with dc-study-app

```
dc-study-app (knowledge source)
    │
    │  curriculum rules, module concepts, exam questions
    │
    ▼
dc-game (gameplay implementation)
    │
    │  each module → a game level
    │  each concept → a game mechanic or challenge
    │
    ▼
  Player learns by doing, not just reading
```

The two projects are **independent repositories** that should never import each other directly. Content synchronization is done manually: when a new module is added to `dc-study-app`, a corresponding level is designed in `dc-game`.
