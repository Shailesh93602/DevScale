/**
 * Replay engine for a recorded battle fixture.
 *
 * A pure function of (fixture, step): no timers, no sockets, no React. The
 * page drives `step` from an auto-play interval or a scrubber and renders
 * whatever state this returns. Keeping it pure is what makes it testable
 * against the whole fixture in a unit test — every step, every score, the
 * winner — rather than eyeballed in a browser.
 */

export interface ReplayPlayer {
  user_id: string;
  username: string;
  avatar_url?: string | null;
}

export interface ReplayQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string | null;
  points: number;
  time_limit: number;
}

export type ReplayEvent =
  | { type: 'battle:started' }
  | { type: 'question:shown'; question_index: number }
  | {
      type: 'answer';
      user_id: string;
      question_index: number;
      option: number;
      is_correct: boolean;
      points_earned: number;
      time_taken_ms: number;
    }
  | { type: 'question:revealed'; question_index: number }
  | { type: 'battle:completed'; winner_id: string };

export interface BattleFixture {
  recordedDemo: true;
  label: string;
  note?: string;
  battle: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
    total_questions: number;
    time_per_question: number;
    points_per_question: number;
  };
  players: ReplayPlayer[];
  questions: ReplayQuestion[];
  events: ReplayEvent[];
}

export interface ReplayAnswer {
  user_id: string;
  option: number;
  is_correct: boolean;
  points_earned: number;
  time_taken_ms: number;
}

export interface ReplayStanding extends ReplayPlayer {
  score: number;
  correct_count: number;
  total_time_ms: number;
  rank: number;
}

export type ReplayPhase = 'idle' | 'in_progress' | 'completed';

export interface ReplayState {
  phase: ReplayPhase;
  /** Index into fixture.questions, or null before the first question. */
  currentQuestionIndex: number | null;
  /** Answers submitted so far for the current question. */
  answers: ReplayAnswer[];
  /** True once the correct option for the current question has been revealed. */
  revealed: boolean;
  /** Sorted, ranked standings after applying every event up to `step`. */
  leaderboard: ReplayStanding[];
  winnerId: string | null;
  /** Human-readable caption of the last event applied — the replay "narration". */
  caption: string;
}

/** The number of steps a fixture has: one per event, plus the idle state at 0. */
export function stepCount(fixture: BattleFixture): number {
  return fixture.events.length + 1;
}

function rank(
  players: ReplayPlayer[],
  totals: Map<string, Omit<ReplayStanding, keyof ReplayPlayer | 'rank'>>,
): ReplayStanding[] {
  return players
    .map((p) => ({
      ...p,
      ...(totals.get(p.user_id) ?? {
        score: 0,
        correct_count: 0,
        total_time_ms: 0,
      }),
    }))
    .sort((a, b) => b.score - a.score || a.total_time_ms - b.total_time_ms)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

/**
 * State after applying the first `step` events (0 = nothing applied).
 * Steps beyond the end clamp to the final state, so a scrubber can never
 * ask for something the fixture does not have.
 */
export function replayStateAt(
  fixture: BattleFixture,
  step: number,
): ReplayState {
  const applied = Math.max(0, Math.min(step, fixture.events.length));
  const totals = new Map<
    string,
    { score: number; correct_count: number; total_time_ms: number }
  >();
  const nameOf = (id: string) =>
    fixture.players.find((p) => p.user_id === id)?.username ?? id;

  let phase: ReplayPhase = 'idle';
  let currentQuestionIndex: number | null = null;
  let answers: ReplayAnswer[] = [];
  let revealed = false;
  let winnerId: string | null = null;
  let caption = 'Press play to watch the recorded battle.';

  for (let i = 0; i < applied; i++) {
    const ev = fixture.events[i];
    switch (ev.type) {
      case 'battle:started':
        phase = 'in_progress';
        caption = 'Battle started — both players are in.';
        break;
      case 'question:shown':
        currentQuestionIndex = ev.question_index;
        answers = [];
        revealed = false;
        caption = `Question ${ev.question_index + 1} of ${fixture.questions.length} is on screen.`;
        break;
      case 'answer': {
        const t = totals.get(ev.user_id) ?? {
          score: 0,
          correct_count: 0,
          total_time_ms: 0,
        };
        t.score += ev.points_earned;
        t.correct_count += ev.is_correct ? 1 : 0;
        t.total_time_ms += ev.time_taken_ms;
        totals.set(ev.user_id, t);
        answers = [
          ...answers,
          {
            user_id: ev.user_id,
            option: ev.option,
            is_correct: ev.is_correct,
            points_earned: ev.points_earned,
            time_taken_ms: ev.time_taken_ms,
          },
        ];
        caption = `${nameOf(ev.user_id)} answered in ${(ev.time_taken_ms / 1000).toFixed(1)}s.`;
        break;
      }
      case 'question:revealed':
        revealed = true;
        caption = `Answer revealed for question ${ev.question_index + 1}.`;
        break;
      case 'battle:completed':
        phase = 'completed';
        winnerId = ev.winner_id;
        caption = `Battle complete — ${nameOf(ev.winner_id)} wins.`;
        break;
    }
  }

  return {
    phase,
    currentQuestionIndex,
    answers,
    revealed,
    leaderboard: rank(fixture.players, totals),
    winnerId,
    caption,
  };
}

/**
 * Sanity checks a fixture must pass before it is shown to anyone. Returns the
 * problems found (empty = fine). Used by the unit test, and cheap enough for
 * the page to run once at module load so a bad edit fails loudly in dev.
 */
export function validateFixture(fixture: BattleFixture): string[] {
  const problems: string[] = [];
  if (fixture.recordedDemo !== true) problems.push('recordedDemo must be true');
  if (!fixture.label) problems.push('label is required');
  if (fixture.players.length !== 2)
    problems.push('a recorded battle has exactly two players');
  if (fixture.questions.length !== fixture.battle.total_questions)
    problems.push('battle.total_questions disagrees with questions[]');

  fixture.questions.forEach((q, i) => {
    if (q.correct_answer < 0 || q.correct_answer >= q.options.length)
      problems.push(`question ${i + 1}: correct_answer out of range`);
  });

  const playerIds = new Set(fixture.players.map((p) => p.user_id));
  fixture.events.forEach((ev, i) => {
    if ('user_id' in ev && !playerIds.has(ev.user_id))
      problems.push(`event ${i}: unknown player ${ev.user_id}`);
    if ('question_index' in ev && !fixture.questions[ev.question_index])
      problems.push(`event ${i}: unknown question ${ev.question_index}`);
    if (ev.type === 'answer') {
      const q = fixture.questions[ev.question_index];
      if (q && ev.is_correct !== (ev.option === q.correct_answer))
        problems.push(`event ${i}: is_correct disagrees with the question key`);
      if (q && ev.is_correct && ev.points_earned !== q.points)
        problems.push(`event ${i}: points_earned disagrees with the question`);
      if (!ev.is_correct && ev.points_earned !== 0)
        problems.push(`event ${i}: a wrong answer must earn 0`);
    }
  });

  const final = replayStateAt(fixture, fixture.events.length);
  if (final.phase !== 'completed')
    problems.push('the last event must complete the battle');
  if (final.winnerId && final.leaderboard[0]?.user_id !== final.winnerId)
    problems.push(
      `declared winner ${final.winnerId} is not first on the computed leaderboard`,
    );
  return problems;
}
