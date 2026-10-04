# Comprehensive PRD: Web-Based Real-time Multiplayer Quiz Racing Game

This document serves as the complete technical prompt specification for building a web-based, real-time multiplayer racing quiz application.

---

## 🛠️ Recommended Tech Stack

* **Frontend Framework:** React / Next.js (Tailwind CSS, Lucide Icons, Framer Motion for animations).
* **Backend / Real-time Engine:** Node.js with Socket.io / Firebase Realtime Database / Supabase Realtime (for live state synchronization between Admin and Players).
* **State Management:** Zustand / Redux Toolkit / React Context.

---

## 👥 Roles & Architecture Overview

1. **Player App (`/play`):** 
   * Joins via Room Code.
   * Configures profile (Team Name, Car Color/Model).
   * Displays Stage Instructions, Questions, Answer Choices, 15-second Countdown, and immediate score feedback.
   * Listens to global game state changes (e.g., PAUSE/UNPAUSE, Next Stage).

2. **Admin Control Panel (`/admin`):**
   * Configures game parameters (Timer per question, Question upload via JSON).
   * Game Controls: Start Race, Pause/Unpause, Force Stage Transition.
   * Live Race Track Leaderboard: Displays real-time progress of all connected teams across 4 interactive race track layouts corresponding to each stage.

---

## 🏎️ Game Mechanics & Stage Logic

The game consists of **4 sequential stages**, mapping questions by difficulty:

| Stage | Name (VN) | Theme Color | Difficulty | Scoring Logic |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **Khởi động** (Warm-up) | Emerald Green (`#10B981`) | Easy | **Correct:** $+ \text{BaseScore}$<br>**Incorrect:** $0$ |
| **Stage 2** | **Tăng tốc** (Acceleration) | Ocean Blue (`#3B82F6`) | Medium | **Correct:** Dynamic Formula `(*)`<br>**Incorrect:** $0$ |
| **Stage 3** | **Thử thách** (Challenge) | Vibrant Orange (`#F97316`) | Hard | **Correct:** Dynamic Formula `(*)`<br>**Incorrect:** Deduct Dynamic Formula `(*)` |
| **Stage 4** | **Về đích** (Finish Line) | Slate Grey (`#475569`) | Medium | **Correct:** $+ \text{BaseScore}$<br>**Incorrect:** $- \text{BaseScore}$ |

### 🧮 Dynamic Score Formula `(*)`
For dynamic scoring (rounded down to the nearest integer):

$$
\text{FinalScore} = \left\lfloor \text{BaseScore} + \left( \text{BaseScore} \times \frac{\text{TimeLeft}}{\text{TotalTime}} \right) \right\rfloor
$$

*Where:*
* $\text{BaseScore}$ = Points assigned to the specific question (default: 100).
* $\text{TimeLeft}$ = Seconds remaining when answer is submitted.
* $\text{TotalTime}$ = Configured question timer limit (default: 15s).

---

## 📁 Question Data Structure (JSON Schema)

The admin panel will accept question uploads structured in the following JSON list format:

```json
[
  {
    "id": "q1",
    "question": "Thủ đô của Việt Nam là gì?",
    "options": ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"],
    "correctIndex": 0,
    "difficulty": "easy",
    "baseScore": 100,
    "explanation": "Hà Nội là thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam."
  },
  {
    "id": "q2",
    "question": "Tính vận tốc tức thời của xe đua tại điểm t = 3s?",
    "options": ["12 m/s", "24 m/s", "36 m/s", "48 m/s"],
    "correctIndex": 1,
    "difficulty": "hard",
    "baseScore": 200,
    "explanation": "Sử dụng công thức v = v0 + at với v0 = 0, a = 8m/s²."
  }
]
```

### Auto-Mapping Rules:
* **Stage 1 (Warm-up):** Filters questions where `difficulty == "easy"`.
* **Stage 2 (Acceleration) & Stage 4 (Finish Line):** Filters questions where `difficulty == "medium"`.
* **Stage 3 (Challenge):** Filters questions where `difficulty == "hard"`.

---

## 🖥️ Page & UI Specifications

### 1. Player Experience (`/play`)
* **Lobby / Setup:**
  * Enter Race Room Code.
  * Enter Team Name (If empty $\rightarrow$ auto-generate random name like *"Speedy Lightning 42"*).
  * Select Car Model & Color (If empty $\rightarrow$ assign random color).
  * Ready button $\rightarrow$ Wait for Admin to start.

* **In-Game Display:**
  * Header: Current Stage Name, Team Name, Live Score, Timer Bar.
  * Main Card: Question content and 4 interactive option buttons.
  * Pause Overlay: Appears full-screen when Admin triggers PAUSE.
  * Stage Transition Screen: Highlights stage switch, new scoring rules, and upcoming theme change.

### 2. Admin Dashboard (`/admin`)
* **Control Panel:**
  * **Question Import:** Drag-and-drop JSON file upload with instant validation preview.
  * **Timer Config:** Global slider/input for question duration (default 15s).
  * **State Controls:** `Start Game`, `Pause / Resume Game`, `Skip Question`, `Force Next Stage`.
* **Live Race Track & Leaderboard:**
  * Displays 4 distinct track visual layouts (Stage 1: Oval Track, Stage 2: Speed Drag Strip, Stage 3: Sharp Hairpin Curves, Stage 4: Grand Prix Finish Line).
  * Each player/team is rendered as an animated car avatar progressing along the track relative to their cumulative score.
  * Track updates dynamically when the game advances to a new stage.

### 3. Summary & Review (`/summary`)
* Final Podiums (1st, 2nd, 3rd Place with animations & confetti).
* Full team leaderboard breakdown.
* Educational Recap: Displays each stage's questions, selected answers, explanations, and key takeaways (`Giải thích các giai đoạn & rút ra bài học`).