import { describe, it, expect } from 'vitest';
import fixtureJson from '@/data/demo-battle.json';
import {
  replayStateAt,
  stepCount,
  validateFixture,
  type BattleFixture,
} from './battle-replay';

const fixture = fixtureJson as unknown as BattleFixture;

/**
 * The recorded battle is a committed fixture, so the only thing that can go
 * wrong with it is a hand edit. These tests make a wrong edit fail CI rather
 * than ship: a declared winner who did not win, an answer marked correct that
 * disagrees with the key, a question count that drifts.
 */
describe('demo battle fixture', () => {
  it('is internally consistent', () => {
    expect(validateFixture(fixture)).toEqual([]);
  });

  it('is labelled as a recording and names no real people', () => {
    expect(fixture.recordedDemo).toBe(true);
    expect(fixture.label).toBe('Recorded demo');
    for (const p of fixture.players) {
      expect(p.username).toMatch(/^Demo Player [AB]$/);
    }
  });
});

describe('replayStateAt', () => {
  it('starts idle with nobody on the board scored', () => {
    const s = replayStateAt(fixture, 0);
    expect(s.phase).toBe('idle');
    expect(s.currentQuestionIndex).toBeNull();
    expect(s.leaderboard.map((e) => e.score)).toEqual([0, 0]);
    expect(s.winnerId).toBeNull();
  });

  it('shows the first question after the first two events, with no answers yet', () => {
    const s = replayStateAt(fixture, 2);
    expect(s.phase).toBe('in_progress');
    expect(s.currentQuestionIndex).toBe(0);
    expect(s.answers).toEqual([]);
    expect(s.revealed).toBe(false);
  });

  it('accumulates score and correct_count as answers land, and resets answers per question', () => {
    // events[2] = A answers q1 correctly, events[3] = B answers q1 wrongly
    const afterQ1 = replayStateAt(fixture, 4);
    expect(afterQ1.answers).toHaveLength(2);
    const a = afterQ1.leaderboard.find((e) => e.user_id === 'demo-player-a')!;
    const b = afterQ1.leaderboard.find((e) => e.user_id === 'demo-player-b')!;
    expect(a.score).toBe(100);
    expect(a.correct_count).toBe(1);
    expect(b.score).toBe(0);

    // events[5] = question 2 shown → answers list is empty again
    const q2 = replayStateAt(fixture, 6);
    expect(q2.currentQuestionIndex).toBe(1);
    expect(q2.answers).toEqual([]);
    expect(q2.revealed).toBe(false);
  });

  it('marks revealed after question:revealed', () => {
    expect(replayStateAt(fixture, 5).revealed).toBe(true);
  });

  it('ends completed with the declared winner ranked first and the recorded totals', () => {
    const final = replayStateAt(fixture, stepCount(fixture) - 1);
    expect(final.phase).toBe('completed');
    expect(final.winnerId).toBe('demo-player-a');
    expect(final.leaderboard[0]).toMatchObject({
      user_id: 'demo-player-a',
      rank: 1,
      score: 400,
      correct_count: 4,
    });
    expect(final.leaderboard[1]).toMatchObject({
      user_id: 'demo-player-b',
      rank: 2,
      score: 300,
      correct_count: 3,
    });
  });

  it('clamps out-of-range steps instead of throwing', () => {
    expect(replayStateAt(fixture, -5)).toEqual(replayStateAt(fixture, 0));
    expect(replayStateAt(fixture, 10_000)).toEqual(
      replayStateAt(fixture, fixture.events.length),
    );
  });

  it('every step has a caption a viewer can read', () => {
    for (let i = 0; i < stepCount(fixture); i++) {
      expect(replayStateAt(fixture, i).caption.length).toBeGreaterThan(10);
    }
  });
});

describe('validateFixture catches the edits that would lie', () => {
  it('a declared winner who did not win', () => {
    const bad = structuredClone(fixture);
    const last = bad.events[bad.events.length - 1];
    if (last.type === 'battle:completed') last.winner_id = 'demo-player-b';
    expect(validateFixture(bad).join('\n')).toMatch(/declared winner/);
  });

  it('an answer marked correct that disagrees with the key', () => {
    const bad = structuredClone(fixture);
    const ev = bad.events.find((e) => e.type === 'answer');
    if (ev && ev.type === 'answer') ev.option = (ev.option + 1) % 4;
    expect(validateFixture(bad).join('\n')).toMatch(/is_correct disagrees/);
  });

  it('a question count that drifted', () => {
    const bad = structuredClone(fixture);
    bad.battle.total_questions = 99;
    expect(validateFixture(bad).join('\n')).toMatch(/total_questions/);
  });
});
