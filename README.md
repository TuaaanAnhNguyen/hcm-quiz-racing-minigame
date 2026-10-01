# HCM Quiz Racing

A web-based quiz racing game.

Players answer quiz questions to earn points and advance their racing cars along a track. The game progresses through four stages with varying difficulties and scoring rules.

## Tech Stack

- React + TypeScript
- Vite
- Zustand (State Management & BroadcastChannel Sync)
- Tailwind CSS (v4)
- Framer Motion
- Lucide React
- Canvas Confetti

## Game Stages & Scoring

| Stage | Name      | Difficulty | Theme  | Correct Answer  | Wrong Answer    |
| ----- | --------- | ---------- | ------ | --------------- | --------------- |
| 1     | Khởi động | Easy       | Green  | `+BaseScore`    | `0`             |
| 2     | Tăng tốc  | Medium     | Blue   | `+DynamicScore` | `0`             |
| 3     | Thử thách | Hard       | Orange | `+DynamicScore` | `-DynamicScore` |
| 4     | Về đích   | Medium     | Slate  | `+BaseScore`    | `-BaseScore`    |

_Dynamic Score Formula:_
$$\text{BaseScore} + \left\lfloor \text{BaseScore} \times \frac{\text{TimeLeft}}{\text{TotalTime}} \right\rfloor$$

## Feature Checklist

### Core & State Management

- [x] TypeScript data models (`types/game.ts`)
- [x] Zustand state store with `BroadcastChannel` multi-tab sync (`store/useGameStore.ts`)
- [x] Default HCM ideology questions dataset (`data/questions.json`)

### Player Experience

- [ ] Lobby screen & registration
- [ ] Car color selection
- [ ] Interactive 15-second timer
- [ ] Quiz question card & answer inputs
- [ ] Answer feedback & real-time scoring
- [ ] Live racing track progress
- [ ] Four-stage game progression
- [ ] Final podium & recap explanations

### Admin / Host Controls

- [ ] JSON question import/export
- [ ] Timer & stage configuration
- [ ] Game controls (Start, Pause/Resume, Skip Question)
- [ ] Force stage transitions
- [ ] Live leaderboard & spectator view

### Multiplayer / Sync

- [ ] Real-time player state synchronization
- [ ] Real-time car position sync across tabs

## Project Structure

```text
hcm-quiz-racing/
├── src/
│   ├── assets/         # Static visual assets
│   ├── components/     # Reusable UI components
│   │   ├── game/       # Racing track & timer components
│   │   └── summary/    # Leaderboard & podium components
│   ├── data/           # Questions JSON
│   ├── pages/          # View pages (Admin, Player, Summary)
│   ├── store/          # Zustand global store & sync
│   ├── types/          # TypeScript interface definitions
│   ├── App.tsx         # Root component & view router
│   ├── index.css       
│   └── main.tsx        # Entry point
├── public/             # Public static assets
└── vite.config.ts      # Vite & Tailwind configuration
```
