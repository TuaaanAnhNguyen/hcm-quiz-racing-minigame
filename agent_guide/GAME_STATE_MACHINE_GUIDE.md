# AI Coding Guidance — Person A
## Build the Game State Machine for HCM Quiz Racing

You are working on the **game-core/state-machine** portion of a small real-time multiplayer quiz racing game.

Your responsibility is to make the **game rules and state transitions correct and deterministic**.

Do NOT focus on UI, animations, Supabase Realtime synchronization, or multiplayer networking yet. Another developer will handle those.

The existing project uses:

- React + TypeScript
- Zustand
- Supabase for question-bank data
- `src/types/game.ts`
- `src/store/useGameStore.ts`
- `src/services/questionService.ts`

The game has 4 sequential stages, with difficulty mapped as:

- Stage 1 → easy
- Stage 2 → medium
- Stage 3 → hard
- Stage 4 → medium

The four stages have different scoring rules.

---

# 1. Core principle

Treat the game as a **finite state machine**, not as a collection of independent booleans.

Do NOT build logic like:

```ts
if (isPlaying && !isPaused && !stageTransition && !isSummary) {
   ...
}
```

Instead, the game should have one authoritative state:

```ts
status: GameState
```

where:

```ts
export enum GameState {
  LOBBY = "lobby",
  PLAYING = "playing",
  PAUSED = "paused",
  STAGE_TRANSITION = "stage_transition",
  SUMMARY = "summary",
}
```

There should be exactly one current game state.

---

# 2. Think in terms of states and events

The state machine should respond to explicit events/actions.

### States

```text
LOBBY
  ↓
PLAYING
  ↓
STAGE_TRANSITION
  ↓
PLAYING
  ↓
STAGE_TRANSITION
  ↓
PLAYING
  ↓
STAGE_TRANSITION
  ↓
PLAYING
  ↓
SUMMARY
```

Pause is a temporary state that can occur while playing:

```text
PLAYING
   │
   ├── PAUSE → PAUSED
   │             │
   │             └── RESUME → PLAYING
   │
   └── normal gameplay
```

The admin can also force a stage transition.

The PRD explicitly requires Start, Pause/Resume, Skip Question, and Force Next Stage controls.

---

# 3. Define valid transitions

Implement and enforce a transition table.

Conceptually:

```text
LOBBY
 └── START_GAME → PLAYING

PLAYING
 ├── PAUSE → PAUSED
 ├── QUESTION_COMPLETE → next question / stage transition
 ├── SKIP_QUESTION → next question
 └── FORCE_NEXT_STAGE → STAGE_TRANSITION

PAUSED
 └── RESUME → PLAYING

STAGE_TRANSITION
 └── CONTINUE → PLAYING
                    or
                    SUMMARY if stage 4 is complete

SUMMARY
 └── RESET → LOBBY
```

Do not allow arbitrary transitions.

For example:

```text
SUMMARY → PAUSE
```

must be rejected.

Likewise:

```text
LOBBY → SUBMIT_ANSWER
```

must do nothing or return an invalid-transition result.

---

# 4. Separate state from events

Create explicit event types.

For example:

```ts
export type GameEvent =
  | { type: "START_GAME" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "SUBMIT_ANSWER"; playerId: string; answerIndex: number }
  | { type: "TIME_EXPIRED" }
  | { type: "NEXT_QUESTION" }
  | { type: "SKIP_QUESTION" }
  | { type: "FORCE_NEXT_STAGE" }
  | { type: "CONTINUE_STAGE" }
  | { type: "RESET_GAME" };
```

The exact API can be adapted to the existing Zustand architecture, but preserve this conceptual separation.

An event says:

> "Something happened."

The state machine decides:

> "What does that mean?"

---

# 5. Design the GameSession

Expand the existing types so that the complete game can be represented by data.

A reasonable starting point is:

```ts
export interface GameSession {
  status: GameState;

  stage: StageNumber;

  questions: Question[];

  currentQuestionIndex: number;

  questionStartedAt: number | null;

  totalTime: number;

  players: Player[];

  answerHistory: AnswerRecord[];
}
```

Add other fields only when they are actually necessary.

Avoid storing values that can be derived.

For example, don't store:

```ts
currentQuestion: Question;
currentQuestionIndex: number;
```

unless there is a specific reason.

Prefer:

```ts
currentQuestionIndex: number;
```

and derive the current question:

```ts
questions[currentQuestionIndex]
```

---

# 6. Add AnswerRecord

The game must retain enough information to produce the final educational recap.

The final summary is expected to show questions, selected answers, explanations, and takeaways.

Use something like:

```ts
export interface AnswerRecord {
  playerId: string;
  questionId: string;

  selectedIndex: number | null;

  correct: boolean;

  scoreEarned: number;

  timeLeft: number;
}
```

Do not discard answer information after moving to the next question.

---

# 7. Question lifecycle

For every question, the lifecycle should be:

```text
QUESTION START
      ↓
timer starts
      ↓
players answer
      ↓
answers are evaluated
      ↓
scores are calculated
      ↓
question ends
      ↓
next question OR stage transition
```

The question should have a single authoritative start timestamp:

```ts
questionStartedAt: number
```

Do not rely on every player's browser clock to determine scoring.

For the first local implementation, you can calculate from the browser clock.

But design the state so that later the server can become authoritative without changing the game rules.

---

# 8. Timer design

Do NOT store a rapidly changing value such as:

```ts
timeLeft: 14
timeLeft: 13
timeLeft: 12
...
```

as the authoritative game state.

Instead store:

```ts
questionStartedAt: number;
totalTime: number;
```

Then calculate:

```ts
timeLeft =
  totalTime -
  elapsedTime;
```

The UI can update every 100ms/250ms/1s as appropriate.

The actual answer evaluation should calculate the remaining time at submission.

The default timer is 15 seconds, but the admin can configure the timer.

---

# 9. Answer submission

Implement:

```ts
submitAnswer(playerId, answerIndex)
```

The function should:

1. Verify the game is in `PLAYING`.
2. Verify the player exists.
3. Verify the player has not already answered the current question.
4. Get the current question.
5. Determine whether the answer is correct.
6. Calculate the current `timeLeft`.
7. Calculate the score using the stage's scoring rules.
8. Update the player's score.
9. Update `correctAnswersCount`.
10. Set `lastAnswerCorrect`.
11. Mark the player as having answered.
12. Add an `AnswerRecord`.
13. Determine whether the question should end.

Do not allow a player to submit twice.

This is important for multiplayer later.

---

# 10. Scoring belongs in a separate pure function

Create:

```text
src/game/scoring.ts
```

Do not put the scoring formula directly inside the React components.

Use something similar to:

```ts
interface ScoreInput {
  stage: StageNumber;
  correct: boolean;
  baseScore: number;
  timeLeft: number;
  totalTime: number;
}

export function calculateScore(input: ScoreInput): number {
  // ...
}
```

The dynamic formula is:

```text
FinalScore =
floor(
  BaseScore +
  BaseScore × TimeLeft / TotalTime
)
```

The specification defines:

- Stage 1: correct = +BaseScore, incorrect = 0
- Stage 2: correct = dynamic score, incorrect = 0
- Stage 3: correct = dynamic score, incorrect = negative dynamic score
- Stage 4: correct = +BaseScore, incorrect = -BaseScore

Keep these rules entirely inside the game-core layer.

---

# 11. Question selection

Create a separate function/module:

```text
src/game/questionSelector.ts
```

It should handle stage → question mapping.

Rules:

```text
Stage 1 → easy
Stage 2 → medium
Stage 3 → hard
Stage 4 → medium
```

These mappings are part of the game's defined rules.

Do not make the React components decide which questions belong to a stage.

The game engine should receive questions and organize them.

---

# 12. Decide how many questions per stage

If the specification does not currently define a fixed number of questions per stage, do NOT invent complicated behavior.

Create a configurable value:

```ts
questionsPerStage
```

or derive it from the loaded question set.

Make this decision explicit in the code.

Do not hardcode:

```ts
if (questionIndex === 9) ...
```

unless the project explicitly defines 10 questions per stage.

---

# 13. Stage transition

When the final question of a stage is complete:

```text
PLAYING
   ↓
STAGE_TRANSITION
```

During `STAGE_TRANSITION`:

- no answers should be accepted
- the current question should not continue
- scoring should be finished
- the next stage should be determined

Then:

```text
STAGE_TRANSITION
   ↓
CONTINUE
   ↓
PLAYING
```

For stage 4:

```text
Stage 4 complete
      ↓
STAGE_TRANSITION
      ↓
SUMMARY
```

Do not jump directly from stage 4's last answer to the summary if the UI needs a finish transition.

---

# 14. Pause/resume

Pause is a global game state.

When:

```ts
pauseGame()
```

is called:

```text
PLAYING → PAUSED
```

When:

```ts
resumeGame()
```

is called:

```text
PAUSED → PLAYING
```

While paused:

- players cannot submit answers
- score cannot change
- the question should not expire
- the timer must effectively stop

Do not simply hide the timer UI.

The underlying game timing must account for the pause.

A good implementation is to track accumulated paused duration or maintain explicit timing information.

Design this now so that later synchronization across browsers is possible.

---

# 15. Skip question

`SKIP_QUESTION` is an admin action.

It should:

1. Stop the current question.
2. Prevent further answers.
3. Move to the next question.
4. Reset per-question player state.
5. Start the next question.

Do not award normal answer points to players because of a skip.

If the project wants a different skip rule later, keep it isolated in the game engine.

---

# 16. Reset behavior

`RESET_GAME` should return the game to a clean lobby.

Conceptually:

```text
SUMMARY
   ↓
RESET
   ↓
LOBBY
```

Reset:

```text
stage
question index
players' scores
answer history
current question
timer
status
```

Do not accidentally retain information from the previous match.

---

# 17. Player state reset between questions

At the start of every new question:

```ts
player.hasAnswered = false;
player.lastAnswerCorrect = undefined;
```

Scores and total correct answers remain.

For example:

```text
Question 1
Team A → correct → +100

Question 2
Team A → hasAnswered = false
Team A → score = 100
Team A → correctAnswersCount = 1
```

Do not reset the player's score between questions or stages.

---

# 18. Multiplayer consideration

Even though you are not implementing networking yet, design the game engine as if there will eventually be multiple clients.

This means:

### Good

```ts
submitAnswer(playerId, answerIndex)
```

### Bad

```ts
setMyScore(newScore)
```

The client should request an action.

The game engine decides the resulting state.

Later, another developer can connect:

```text
Player
  ↓
Realtime
  ↓
Game engine
  ↓
new GameSession
  ↓
Realtime
  ↓
all players
```

The game rules should not need to change when multiplayer is added.

---

# 19. Do not put Supabase Realtime inside the game engine

Keep this separation:

```text
                    ┌─────────────────┐
                    │   Game Engine   │
                    │                 │
                    │ rules           │
                    │ transitions     │
                    │ scoring         │
                    │ validation      │
                    └────────┬────────┘
                             │
                       GameSession
                             │
              ┌──────────────┴──────────────┐
              │                             │
       Zustand/local UI              Realtime adapter
```

The game engine should not know whether state is being synchronized with:

- Supabase
- Socket.io
- local state
- tests

This separation is important because another developer owns the multiplayer layer.

---

# 20. Recommended file structure

Person A should primarily work in:

```text
src/
├── game/
│   ├── scoring.ts
│   ├── scoring.test.ts
│   ├── stages.ts
│   ├── questionSelector.ts
│   └── gameReducer.ts        ← optional
│
├── store/
│   └── useGameStore.ts
│
└── types/
    └── game.ts
```

Do not modify:

```text
src/components/
src/pages/
src/services/
src/lib/
```

unless an integration change is genuinely necessary.

---

# 21. Prefer pure transition logic

The most testable design is:

```ts
nextState = transition(currentState, event);
```

For example:

```ts
const next = transition(state, {
  type: "START_GAME",
});
```

Then:

```text
LOBBY + START_GAME
       ↓
PLAYING
```

Another example:

```ts
transition(state, {
  type: "PAUSE_GAME",
});
```

results in:

```text
PLAYING + PAUSE_GAME
       ↓
PAUSED
```

This function should not:

- render React
- access the DOM
- call Supabase
- call `setTimeout`
- manipulate components

It should primarily transform state.

---

# 22. Timer should be separated from state transitions

Do not create a giant timer implementation inside the store.

Separate:

```text
Timer calculation
        +
Game state transition
```

For example:

```text
Timer
  ↓
TIME_EXPIRED event
  ↓
Game engine
  ↓
finish question
  ↓
next question / stage
```

This will make the timer easier to synchronize later.

---

# 23. Tests are mandatory for the state machine

Before declaring the game engine complete, test at least:

### State transitions

```text
LOBBY → PLAYING
PLAYING → PAUSED
PAUSED → PLAYING
PLAYING → STAGE_TRANSITION
STAGE_TRANSITION → PLAYING
STAGE 4 → SUMMARY
SUMMARY → LOBBY
```

### Invalid transitions

```text
LOBBY + SUBMIT_ANSWER
SUMMARY + SUBMIT_ANSWER
SUMMARY + PAUSE
LOBBY + RESUME
```

These should not modify the state.

### Scoring

Test every stage:

```text
Stage 1 correct
Stage 1 incorrect

Stage 2 correct
Stage 2 incorrect

Stage 3 correct
Stage 3 incorrect

Stage 4 correct
Stage 4 incorrect
```

### Multiplayer behavior

Test:

```text
Player A answers
Player A cannot answer twice

Player B can still answer

Player A's score changes
Player B's score does not

Question ends
All players' hasAnswered resets
```

---

# 24. Definition of done

Person A is finished when all of the following are true:

- [ ] Game has an explicit state machine.
- [ ] Invalid state transitions are prevented.
- [ ] Four stages work sequentially.
- [ ] Questions are mapped to stages by difficulty.
- [ ] Question progression works.
- [ ] Player answer submission works.
- [ ] Duplicate answers are rejected.
- [ ] Timer expiration ends questions correctly.
- [ ] Pause/resume works.
- [ ] Skip question works.
- [ ] Force next stage works.
- [ ] All four scoring rules are implemented.
- [ ] Answer history is recorded.
- [ ] Reset returns the game to a clean lobby.
- [ ] Game logic does not depend on React components.
- [ ] Game logic does not depend on Supabase Realtime.
- [ ] Unit tests cover the major transitions and scoring rules.

Most importantly:

> **The game should be completely playable using the game engine with mocked/local players before multiplayer synchronization is added.**

That gives Developer B a stable contract to integrate against rather than having multiplayer logic and game rules evolve simultaneously.