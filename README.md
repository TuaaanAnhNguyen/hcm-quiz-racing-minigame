# HCM Quiz Racing

A web-based quiz racing game.

Players answer quiz questions to earn points and advance their racing cars along a track. The game progresses through four stages with varying difficulties and scoring rules.

Car sprites are made by [looneybits](https://looneybits.itch.io/2d-race-cars).

## Tech Stack

- React + TypeScript
- Vite
- Zustand (Admin-authoritative game state)
- Supabase Realtime (Player/admin messaging)
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
- [x] Admin-authoritative Zustand state store (`store/useGameStore.ts`)
- [x] Default HCM ideology questions dataset (`data/questions.json`)

### Player Experience

- [x] Player lobby and realtime registration
- [x] Racing car selection
- [x] Quiz question card & answer inputs
- [x] Answer feedback & real-time scoring
- [x] Live racing track progress
- [x] Four-stage game progression
- [x] Final podium & recap explanations

### Admin / Host Controls

- [ ] Timer & stage configuration
- [x] Separate admin screen with Start, Pause/Resume, Skip, and Force Stage controls
- [x] Admin-owned timer expiry, answer evaluation, and score calculation
- [x] Live leaderboard and client-rendered score-based track positions

### Multiplayer / Sync

- [x] Realtime player state synchronization through Supabase Broadcast
- [x] Realtime car position updates from synchronized scores

## Project Structure

```
hcm-quiz-racing
├─ .oxlintrc.json
├─ agent_guide
│  └─ GAME_STATE_MACHINE_GUIDE.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.svg
│  └─ icons.svg
├─ README.md
├─ src
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets
│  │  ├─ hero.png
│  │  ├─ pitstop_car_11.png
│  │  ├─ pitstop_car_12.png
│  │  ├─ pitstop_car_13.png
│  │  ├─ pitstop_car_14.png
│  │  ├─ pitstop_car_15.png
│  │  ├─ pitstop_car_16.png
│  │  ├─ pitstop_car_17.png
│  │  ├─ pitstop_car_18.png
│  │  ├─ pitstop_car_19.png
│  │  ├─ pitstop_car_20.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ components
│  │  ├─ game
│  │  │  ├─ AnswerButton.tsx
│  │  │  ├─ LiveRaceTracking.tsx
│  │  │  ├─ PlayerStatus.tsx
│  │  │  ├─ QuestionCard.tsx
│  │  │  ├─ QuestionResult.tsx
│  │  │  └─ SpectatorView.tsx
│  │  ├─ summary
│  │  │  └─ Podium.tsx
│  │  └─ Timer.tsx
│  ├─ data
│  │  ├─ cars.ts
│  │  ├─ convertcsv.csv
│  │  └─ questions.json
│  ├─ game
│  │  ├─ gameReducer.test.ts
│  │  ├─ gameReducer.ts
│  │  ├─ questionSelector.ts
│  │  ├─ scoring.ts
│  │  ├─ stages.ts
│  │  └─ timer.ts
│  ├─ index.css
│  ├─ lib
│  │  ├─ roomRouting.ts
│  │  └─ supabase.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ AdminPage.tsx
│  │  ├─ GamePage.tsx
│  │  ├─ HostSetupPage.tsx
│  │  ├─ LiveRacePanel.tsx
│  │  ├─ LobbyPage.tsx
│  │  └─ SummaryPage.tsx
│  ├─ services
│  │  └─ questionService.ts
│  ├─ store
│  │  └─ useGameStore.ts
│  └─ types
│     └─ game.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vercel.json
└─ vite.config.ts

```