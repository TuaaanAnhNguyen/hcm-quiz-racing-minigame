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

## Multiplayer Setup

The admin opens `/admin`; racers open `/`. Keep one admin session active for each race. The admin browser owns the game state machine, timer decisions, answer evaluation, scoring, and stage progression. Player browsers send join and answer messages, then render the latest session and scores received through Supabase Realtime. Scores are not written to the database.

Create a `.env` file with the Supabase project URL and publishable key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Enable Supabase Realtime Broadcast for the project. Admin and player browsers must use the same project and room. The bundled `src/data/questions.json` is used if Supabase is not configured; without Supabase, `/admin` can preview the dashboard, but players cannot join or start a multiplayer race.

The `/admin` path is a client-side role boundary, not authentication. Restrict access to that route and the Realtime channel before using the game with untrusted users; a production deployment should enforce admin identity with Supabase Auth and channel policies.

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
- [-] Live racing track progress (Needs to be rework into vertical view due to vertical sprites + side-by-side with question view; 70% question, 30% live track)
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
│  │  └─ supabase.ts
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ GamePage.tsx
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
└─ vite.config.ts

```