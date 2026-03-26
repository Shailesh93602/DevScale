# Battle Zone — MVP Product Specification

**Purpose of this document**: Define the ideal battle zone experience from scratch — what we build, what we skip, how it works, how it looks, and how we ship it phase by phase. This is not a description of what exists today. Treat this as the source of truth.

---

## What Battle Zone Is

A real-time, competitive quiz platform where engineering students race against each other to answer topic-based questions as fast and accurately as possible. The core appeal is the **live competitive pressure** — you see your opponent's progress in real time, scores update after every answer, and the winner is known the moment the last question is submitted.

The emotional arc of a good battle: *excitement in lobby → intensity during questions → satisfaction (or motivation) at results.*

---

## What We Are NOT Building (Scope Boundaries)

These are intentionally excluded from every phase until explicitly decided otherwise:

| Excluded | Why |
|---|---|
| Code execution / judge system | Unreliable latency, infra complexity, out of scope for quiz battles |
| Tournament brackets | Requires scheduling infra; save for post-MVP |
| Friend/invite-only battles | Auth complexity; private battles via invite link is enough |
| Elo / skill rating | Needs enough match history first; add in Phase 3 |
| Battle replay | No immediate user value; complex to implement well |
| Hints system | Slows competitive pace; contradicts the format |
| Spectator mode | Nice-to-have; not MVP |
| Team battles | Complex UX and scoring; Phase 3+ |
| Voice/video | Out of scope entirely |
| Offline answer queueing | Complexity with no real user need at this scale |

---

## Battle Types We Support

### 1. Quick Battle (MVP Core)
- 2–6 players
- 5–20 questions, MCQ only
- Each question has a time limit (15–60 seconds)
- Players must answer within the window or forfeit that question's points
- Score = (correct × base_points) + speed_bonus
- Speed bonus: answering in first 25% of time limit = +50%, first 50% = +25%

### 2. Scheduled Battle (Phase 2)
- Set a future start time
- Open for joining until start
- Lobby countdown synced server-side
- Max participants: up to 20

### 3. Practice Battle (Phase 2)
- Solo — no opponents, no pressure
- Same interface as a real battle
- No score recorded on leaderboard
- Used for topic revision

---

## Data Model (Ideal)

```
Battle
  id, title, description
  type: QUICK | SCHEDULED | PRACTICE
  status: WAITING | LOBBY | IN_PROGRESS | COMPLETED | CANCELLED
  difficulty: EASY | MEDIUM | HARD | MIXED
  topic_id (FK)
  created_by (FK → User)
  max_participants (2–20)
  current_participants
  questions_count
  time_per_question (seconds)
  points_per_question
  start_time (nullable for QUICK)
  ended_at
  winner_id (FK → User, nullable)
  is_public (boolean)
  invite_code (for future private battles)
  created_at

BattleQuestion
  id, battle_id, order
  question (text)
  options: string[] (4 options, MCQ)
  correct_answer (index 0–3)
  explanation (shown at results)
  time_limit (override per-question if different)
  points

BattleParticipant
  id, battle_id, user_id
  status: JOINED | READY | PLAYING | COMPLETED | DISCONNECTED
  score
  rank
  correct_count
  wrong_count
  avg_time_per_answer (ms)
  joined_at, completed_at, last_seen_at

BattleAnswer
  id, battle_id, question_id, user_id
  selected_option (index)
  is_correct (boolean)
  time_taken_ms
  submitted_at

BattleLeaderboard
  id, battle_id, user_id
  final_score, final_rank
  correct_count, total_time_ms
  recorded_at
```

**Key design decisions:**
- `status` uses clean transitions: WAITING → LOBBY → IN_PROGRESS → COMPLETED
- No separate "UPCOMING" / "ARCHIVED" — archive is a soft-delete concern, not a status
- `winner_id` set by backend when battle completes (not frontend)
- `BattleAnswer` records every answer including wrong ones — needed for results breakdown

---

## API Endpoints (Ideal)

All under `/api/v1/battles`. Auth required unless noted.

| Method | Path | Description |
|---|---|---|
| GET | `/` | Browse battles (public, no auth) |
| GET | `/:id` | Battle details (no auth for public battles) |
| GET | `/:id/questions` | Questions (auth + must be participant + IN_PROGRESS only) |
| GET | `/:id/leaderboard` | Live or final leaderboard |
| GET | `/:id/results` | Detailed results with answer breakdown (COMPLETED only) |
| GET | `/my` | My battles (auth) |
| GET | `/statistics/me` | My overall stats (auth) |
| POST | `/` | Create battle |
| POST | `/:id/join` | Join a battle |
| POST | `/:id/leave` | Leave (WAITING/LOBBY only) |
| POST | `/:id/ready` | Mark self as ready in lobby |
| POST | `/:id/start` | Creator starts battle manually |
| POST | `/:id/answer` | Submit answer for current question |
| PATCH | `/:id/cancel` | Creator cancels (WAITING/LOBBY only) |

**Intentionally removed from MVP:**
- `/submit` (batch) — submit one answer at a time, not in batch
- `/archive` — backend handles cleanup automatically
- `/reschedule` — out of MVP scope
- `/statistics` returning all users — only `me` endpoint for MVP

---

## WebSocket Events (Ideal)

**Connection:** Client connects with Supabase JWT in auth handshake. Backend verifies and attaches user to socket.

**Client emits:**
```
battle:join      { battleId }             → join the socket room
battle:leave     { battleId }             → leave the room
battle:ready     { battleId }             → mark ready in lobby
battle:answer    { battleId, questionId, selectedOption, timeTakenMs }
chat:send        { battleId, message }
```

**Server broadcasts to room:**
```
battle:participant_joined   { user: { id, username, avatarUrl }, totalCount }
battle:participant_left     { userId, totalCount }
battle:participant_ready    { userId, readyCount, totalCount }
battle:countdown            { secondsRemaining }   → lobby countdown (every second)
battle:started              { startsAt }           → battle is now IN_PROGRESS
battle:question             { index, totalQuestions, timeLimit, endsAt }
battle:timer_tick           { secondsRemaining }   → question timer (every second)
battle:score_update         { leaderboard: [{ userId, username, avatarUrl, score, rank, correctCount }] }
battle:completed            { winnerId, leaderboard, duration }
chat:message                { userId, username, avatarUrl, message, timestamp }
```

**Server emits to individual socket:**
```
battle:answer_result        { questionId, isCorrect, pointsEarned, correctAnswer, explanation }
battle:state                { ...full battle state }   → on reconnect
error                       { code, message }
```

**Key design decisions:**
- `battle:question` carries only metadata (index, timer) — not question content; questions fetched once via REST on battle start
- `battle:score_update` sends full sorted leaderboard array — simpler than incremental updates
- `battle:answer_result` fires immediately after server processes answer — gives instant feedback
- `battle:timer_tick` fires every second from the server — no client-side timer drift
- On reconnect, server emits `battle:state` with full current state so client can resync

---

## Scoring Algorithm

```
base_points = question.points (default 100)
time_fraction = time_taken_ms / (time_limit_ms)

speed_multiplier =
  if time_fraction <= 0.25 → 1.5   (+50%)
  if time_fraction <= 0.50 → 1.25  (+25%)
  if time_fraction <= 0.75 → 1.0   (no bonus)
  if time_fraction <= 1.00 → 0.75  (-25% for slow answer)

points_earned = correct ? floor(base_points × speed_multiplier) : 0

No negative points for wrong answers (never punish attempting).
```

Rank is recalculated and broadcast after each answer across all participants.
Tiebreaker: lower total answer time wins.

---

## UI/UX — Screen by Screen

### 1. Browse Battles (`/battle-zone`)

**Layout:** Full-width grid of BattleCards with a top filter bar.

**Filter bar:**
- Topic dropdown (multiselect)
- Difficulty tabs (All / Easy / Medium / Hard)
- Status tabs (All / Waiting / Live / Completed)
- Search input (debounced 300ms)

**BattleCard contains:**
- Battle title (truncated at 2 lines)
- Topic chip (colored by topic)
- Difficulty badge (green/yellow/red dot)
- Status indicator: `● LIVE` (pulsing red), `WAITING 3/6`, `COMPLETED`
- Creator avatar + name
- Question count + time per question
- "Join" or "View Results" CTA

**What NOT to show on card:** description (too much noise), exact timestamps, points config.

**Empty state:** Friendly illustration with "No battles yet — be the first to create one" + Create Battle button.

**Real-time updates:** Cards update live via WebSocket participant counts — no page refresh needed.

---

### 2. Create Battle (`/battle-zone/create`)

**Single-page form, not multi-step.** Multi-step adds friction. One scrollable page with clear sections.

**Fields:**
- Title (required, 5–80 chars)
- Topic (searchable dropdown, required)
- Difficulty (segmented control: Easy / Medium / Hard / Mixed)
- Number of questions (slider: 5–20, default 10)
- Time per question (slider: 15–60 seconds, default 30)
- Max participants (stepper: 2–10, default 6)
- Battle type (Quick / Scheduled) — if Scheduled, show date/time picker

**Question section (below form):**
- Show how questions will be pulled: "Questions will be randomly selected from [Topic] at [Difficulty] difficulty from the question bank."
- OR: Toggle "Pick questions manually" → opens a searchable list of questions from DB
- For MVP: random selection from topic's question bank. Manual selection is Phase 2.

**Create button:** Fixed at bottom on mobile, inline at bottom on desktop. Disabled until form is valid.

**Validation (frontend Yup):**
- Title required, 5–80 chars
- Topic required
- Questions count: min 5, max 20
- Time per question: min 15, max 60
- Max participants: min 2, max 10
- If Scheduled: start_time must be at least 5 minutes in the future

---

### 3. Battle Lobby (`/battle-zone/[id]/lobby`)

**Purpose:** Gathering room before the battle. Creator waits for players; players wait for creator.

**Layout:**
- Left (60%): Participant grid with avatars, names, ready status
- Right (40%): Battle info panel (topic, difficulty, questions, time per q)

**Participant card:** Avatar, username, "Ready" / "Not Ready" badge. Creator has crown icon.

**Bottom bar:**
- For participants: "I'm Ready" toggle button. Once all ≥2 participants ready, shows "Waiting for host to start"
- For creator: "Start Battle" button (enabled when ≥2 participants and all are ready). Shows "(X/Y ready)" count.
- If Scheduled battle: Shows countdown timer "Battle starts in 02:34" — server-driven, not client

**Live updates:** Participant joins/leaves in real time. No refresh.

**Max wait guard:** If fewer than 2 participants remain after 5 minutes of LOBBY status, auto-cancel. Server handles this.

**Chat:** Compact chat panel in the right column below battle info. Lightweight pre-battle chat.

---

### 4. Battle Interface (`/battle-zone/[id]`)

This is the most critical screen. Must feel fast, tight, competitive.

**Layout (desktop):**
```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Battle title | Q 3/10 | ██████████░░░░ 18s remaining  │
├───────────────────────────────────────┬─────────────────────────┤
│                                       │  LIVE LEADERBOARD       │
│  QUESTION                             │  ─────────────────────  │
│  ─────────────────────────────────    │  1. 🥇 @alice   450pts  │
│  "Which sorting algorithm has         │  2. 🥈 @you     380pts  │
│   O(n log n) worst-case?"             │  3. 🥉 @bob     320pts  │
│                                       │  4.    @carol   280pts  │
│  A  Bubble Sort                       │                         │
│  B  Merge Sort          ← selected    │  ─────────────────────  │
│  C  Quick Sort                        │  BATTLE CHAT (compact)  │
│  D  Heap Sort                         │  alice: let's go!!      │
│                                       │  bob: gg                │
│  [Submit Answer]                      │                         │
└───────────────────────────────────────┴─────────────────────────┘
```

**Layout (mobile):** Full-screen question + options. Leaderboard and chat accessible via bottom sheet tabs.

**Question area details:**
- Question number progress: "Question 3 of 10"
- Server-synced countdown bar (shrinks in real time, turns red at <10s)
- Question text (large, centered)
- 4 option buttons (full-width, labeled A/B/C/D)
- No "next" button — submitting locks the answer, shows instant feedback (green correct / red wrong + explanation flash), then auto-advances after 2 seconds

**After submitting:**
- Option turns green/red immediately
- Correct answer highlighted if wrong
- Brief explanation text appears (1–2 lines)
- "Points earned: +75" or "No points" badge shown
- Auto-advance to next question after 2 seconds (no click needed)
- If time runs out before submitting: auto-submits with 0 points, shows correct answer briefly

**Leaderboard panel (live):**
- Full sorted list
- Highlights "you" row
- Score animates when updated
- Rank change indicator (↑/↓ with color)

**Timer bar behavior:**
- Full width = full time
- Animates smoothly driven by `battle:timer_tick` events
- Green → yellow → red transitions at 50% and 25% remaining

**What NOT to show during battle:**
- Previous questions (no going back)
- How many questions others have answered (only their score and rank)
- Ads, banners, unrelated navigation

---

### 5. Results Screen (`/battle-zone/[id]/results`)

Shown automatically when `battle:completed` fires. Also accessible via URL after battle ends.

**Above fold:**
- Winner announcement with confetti animation (winner only)
- Podium: Top 3 with avatars, names, scores
- "Your position: #2 with 380 points"

**Question-by-question breakdown (scrollable):**
- Each question row: question text (truncated) | your answer | correct answer | points earned | time taken
- Color coded: green (correct) / red (wrong) / grey (time out)

**Stats summary:**
- Correct: 7/10
- Accuracy: 70%
- Average answer time: 12.4s
- Fastest answer: 4.2s
- Total score: 380

**Actions:**
- "Play Again" → creates new battle with same config (Phase 2)
- "View Full Leaderboard" → scrollable all-participants table
- "Share Result" → copy link (Phase 2)
- "Back to Battle Zone" → primary CTA

---

### 6. My Battles (`/battle-zone/my-battles`)

Simple table/list of battles you created or participated in.

**Columns:** Status badge | Title | Your score | Your rank | Date | Actions

**Actions per row:** View Results (completed) | Go to Lobby (waiting/lobby) | View (in-progress)

---

### 7. Global Leaderboard (`/battle-zone/leaderboard`)

**Top section:** Top 3 users with large cards (avatar, stats, badge)

**Table below:** Rank, avatar, username, total battles, win rate, total points, best streak

**Filters:** All Time / This Week / This Month / By Topic

---

## State Machine (Battle Lifecycle)

```
WAITING ──(creator cancels)──→ CANCELLED
   │
   └──(2+ players, creator starts OR scheduled time)──→ LOBBY
                                                           │
                                              (all ready, creator starts)──→ IN_PROGRESS
                                                           │
                                              (creator cancels)──→ CANCELLED
                                                                       │
                                                          (last question answered OR time expires)──→ COMPLETED
```

**Rules:**
- Only creator can start (for Quick battles)
- Scheduled battles auto-start at `start_time` via server cron/timer
- Cannot join a CANCELLED or COMPLETED battle
- Cannot join an IN_PROGRESS battle (Phase 2 may allow late join)
- COMPLETED battles are read-only — leaderboard and results are frozen

---

## Anti-Cheat (MVP Minimal, No Complexity)

**What we do:**
- Rate limit: max 1 answer submission per 2 seconds per user
- Server validates `time_taken_ms` is plausible (not 0ms, not > time_limit)
- Server checks: question belongs to battle, user is participant, question not already answered by this user
- If `time_taken_ms` is <500ms, cap it at 500ms (prevents gaming speed bonus)

**What we don't do for MVP:**
- Tab-switch detection
- Copy-paste detection
- Eye-tracking / proctoring
- Complex behavioral scoring

---

## Test Cases

### Backend Unit Tests

**Battle Creation**
- [ ] Creates battle with valid payload → 201, returns battle object
- [ ] Rejects creation without auth → 401
- [ ] Rejects title < 5 chars → 400 validation error
- [ ] Rejects questions_count < 5 → 400
- [ ] Rejects time_per_question < 15 → 400
- [ ] Rejects scheduled battle with start_time in the past → 400
- [ ] Rate limits: 3rd battle creation within 1 minute → 429

**Battle Join**
- [ ] Valid user joins WAITING battle → 200, current_participants incremented
- [ ] Joining COMPLETED battle → 400 with clear message
- [ ] Joining CANCELLED battle → 400
- [ ] Joining battle at max_participants → 400
- [ ] Joining same battle twice → 400 "already joined"
- [ ] Rate limits excessive join attempts → 429

**Answer Submission**
- [ ] Correct answer → 200, is_correct=true, points awarded with speed bonus
- [ ] Wrong answer → 200, is_correct=false, 0 points
- [ ] Answer submitted after time_limit → 400 or 0 points (time expired)
- [ ] Same question answered twice → 400
- [ ] Answer for question not in this battle → 403
- [ ] `time_taken_ms < 500` → capped at 500ms in scoring
- [ ] Unauthenticated submission → 401

**Battle Status Transitions**
- [ ] WAITING → LOBBY (valid) → 200
- [ ] LOBBY → IN_PROGRESS (valid) → 200
- [ ] IN_PROGRESS → COMPLETED (valid) → 200
- [ ] COMPLETED → IN_PROGRESS (invalid) → 400
- [ ] WAITING → COMPLETED (invalid skip) → 400
- [ ] Non-creator updating status → 403

**Leaderboard**
- [ ] Returns participants sorted by score descending
- [ ] Tiebreaker: lower total_time_ms ranks higher
- [ ] Completed battle leaderboard is frozen (doesn't change after COMPLETED)

### Backend Integration Tests

- [ ] Full battle flow: create → join (2 users) → start → submit all answers → complete → results match
- [ ] WebSocket: participant join broadcasts to all room members
- [ ] WebSocket: score_update sent to room after each answer
- [ ] WebSocket: battle:completed fires when last participant answers last question
- [ ] Reconnected participant receives `battle:state` with current question index and leaderboard

### Frontend Component Tests

**BattleCard**
- [ ] Renders title, topic, difficulty
- [ ] Shows "LIVE" indicator for IN_PROGRESS battles
- [ ] Shows participant count "3/6"
- [ ] "Join" button hidden for COMPLETED battles
- [ ] Clicking Join navigates to correct route

**BattleInterface (Question Flow)**
- [ ] Renders question text and 4 options
- [ ] Option selection highlights the selected button
- [ ] Submit button disabled until option selected
- [ ] After submit: shows correct/wrong feedback
- [ ] Auto-advances to next question after 2s
- [ ] Timer bar shrinks over time
- [ ] Timer bar turns red at < 10 seconds
- [ ] On last question submit: navigates to results

**Lobby**
- [ ] Shows all participants in real time
- [ ] Ready status updates without refresh
- [ ] "Start Battle" disabled until ≥2 ready participants
- [ ] Countdown timer shows and counts down for scheduled battles
- [ ] Creator sees Start button, participants see waiting message

**Results Screen**
- [ ] Correct answer shown for each question
- [ ] Points per question displayed accurately
- [ ] Score and rank match what was shown in leaderboard
- [ ] Winner has confetti animation

### E2E Tests (Playwright)

- [ ] Complete happy path: create → join as 2nd user → both ready → start → answer all → see results
- [ ] Creating battle with invalid data shows validation errors without submitting
- [ ] Joining a full battle shows error message
- [ ] Disconnecting mid-battle and reconnecting: state is restored
- [ ] Time-out on question: auto-submits, question advances
- [ ] Mobile viewport: battle interface is usable, options are tappable

---

## Visual Testing Checklist

**Themes:** Every screen tested in both light and dark mode — no hardcoded colors anywhere.

**Responsive breakpoints:** 375px (mobile) / 768px (tablet) / 1280px+ (desktop)

**States to visually verify per component:**
- BattleCard: waiting / live / completed states
- BattleInterface: idle / option selected / submitted correct / submitted wrong / time critical (<10s) / time expired
- Leaderboard row: my row vs others / rank up / rank down
- Lobby: 1 participant / full / all ready / waiting for host
- Results: winner view / non-winner view / solo (practice)

**Animations to verify (don't break on slow CPUs):**
- Timer bar shrink (smooth, not janky)
- Score update pulse in leaderboard
- Rank change arrow (↑ green / ↓ red)
- Confetti on winner results screen
- Correct/wrong answer flash

---

## Phase Breakdown

### Phase 1 — Core Battle Loop (MVP Ship Target)

**Goal:** A real, end-to-end playable battle. Everything else is secondary.

**Backend:**
- [ ] Clean `Battle`, `BattleQuestion`, `BattleParticipant`, `BattleAnswer`, `BattleLeaderboard` schema (no legacy fields)
- [ ] `POST /battles` — create with random question selection from topic bank
- [ ] `GET /battles`, `GET /battles/:id` — browse and view
- [ ] `POST /battles/:id/join`, `POST /battles/:id/leave`
- [ ] `POST /battles/:id/ready`, `POST /battles/:id/start`
- [ ] `GET /battles/:id/questions` (only in IN_PROGRESS for participants)
- [ ] `POST /battles/:id/answer` — single answer submission with scoring
- [ ] `GET /battles/:id/leaderboard`, `GET /battles/:id/results`
- [ ] Status transition validation (clean state machine)
- [ ] All WebSocket events: participant_joined, participant_ready, countdown, started, question, timer_tick, score_update, answer_result, completed
- [ ] Auto-complete battle when all participants finish all questions
- [ ] Scoring algorithm with speed bonus
- [ ] `winner_id` set on completion

**Frontend:**
- [ ] Browse battles page with filter bar
- [ ] Create battle form (single page)
- [ ] Battle detail page (pre-join view)
- [ ] Lobby screen with real-time participants and ready system
- [ ] Battle interface: question + options + server timer + live leaderboard panel
- [ ] Instant answer feedback (correct/wrong + explanation flash)
- [ ] Auto-advance to next question after 2s
- [ ] Results screen: podium + answer breakdown + stats
- [ ] My battles page
- [ ] All screens: light + dark mode, mobile + desktop
- [ ] WebSocket connection with reconnection handling

**Tests:**
- [ ] All backend unit tests listed above
- [ ] Happy-path E2E test (2 users, full battle)
- [ ] Visual spot-check: light/dark, mobile/desktop for all Phase 1 screens

---

### Phase 2 — Scheduled Battles + Polish

**Goal:** Battles you can advertise and share in advance. Better engagement tools.

**Backend:**
- [ ] Scheduled battle type with server-side auto-start at `start_time`
- [ ] Practice mode (solo, no leaderboard recorded)
- [ ] `GET /battles/my` with role filter (created / participated)
- [ ] `GET /battles/statistics/me` — wins, total battles, accuracy rate, avg score
- [ ] `PATCH /battles/:id/cancel` (creator only, WAITING/LOBBY only)
- [ ] Manual question selection (creator picks specific questions)
- [ ] Lobby countdown broadcast (`battle:countdown` every second for scheduled battles)

**Frontend:**
- [ ] Scheduled battle creation (date/time picker)
- [ ] Lobby shows server-driven countdown for scheduled battles
- [ ] Practice mode flow (no opponents, no competitive UI)
- [ ] Statistics page (`/battle-zone/statistics`)
- [ ] Chat in lobby and during battle (compact panel)
- [ ] Cancel battle flow (confirmation modal)

**Tests:**
- [ ] Scheduled battle auto-starts at correct time
- [ ] Practice battle doesn't write to leaderboard
- [ ] Cancel battle cleans up participant records
- [ ] E2E: scheduled battle countdown → auto-start
- [ ] E2E: practice mode full flow

---

### Phase 3 — Engagement & Competitive Depth

**Goal:** Reasons to come back. Track record. Real competition.

**Backend:**
- [ ] Global leaderboard aggregation (wins, total points, win rate, by topic)
- [ ] Topic-level statistics per user
- [ ] Achievement triggers (first win, 10 battles, 100% accuracy battle)
- [ ] ELo rating system (basic: ±rating per battle based on outcome vs opponent strength)
- [ ] Private battles via invite code (`is_public: false`, share `invite_code`)
- [ ] Battle history pagination with search

**Frontend:**
- [ ] Global leaderboard page with filters (all time / weekly / by topic)
- [ ] Achievement badges on profile and results screen
- [ ] User profile shows battle stats and recent battles
- [ ] Share result card (visual card for social sharing)
- [ ] "Rematch" button on results screen
- [ ] Private battle creation + share invite link flow

---

### Phase 4 — Tournament Mode (Future)

Excluded until Phase 3 is stable. Requires:
- Bracket engine
- Async match scheduling
- Prize/reward system design

Do not spec until Phase 3 ships.

---

## Implementation Notes

**Question Bank Dependency:** Phase 1 random question selection requires the question bank to have sufficient questions per topic and difficulty. If the bank is sparse, battles will have repeated questions. Seed at least 50 questions per topic/difficulty combination before opening battles to users.

**Socket Room Naming:** Use `battle:{id}` as the room name consistently. Never expose internal socket IDs to clients.

**Clock Authority:** The server is the single source of truth for all timers. The client renders timers based on `battle:timer_tick` events and `endsAt` timestamps — never starts its own independent countdown.

**Reconnection Contract:** On reconnect within the same battle, client emits `battle:join` again. Server responds with `battle:state` containing: current question index, question metadata (no answer), current leaderboard, battle status. Client resumes from there.

**Question Security:** `GET /battles/:id/questions` returns questions without `correct_answer`. The correct answer is only sent in `battle:answer_result` after submission — never before.

**Completion Trigger:** Battle completes when ALL participants have submitted answers to ALL questions OR when `ended_at` timestamp passes — whichever comes first. Server runs a scheduled check every 30 seconds for time-based completion. Socket event fires immediately on condition met.

**Concurrency:** Answer submission must be wrapped in a DB transaction to prevent race conditions on score update and rank calculation.
