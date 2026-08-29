import { describe, it, expect } from 'vitest';
import {
  normalizeBattle,
  normalizeBattleParticipant,
} from './battle-normalizer';

describe('normalizeBattle — status/type/difficulty aliasing', () => {
  it('maps legacy status aliases onto the canonical set', () => {
    expect(normalizeBattle({ status: 'UPCOMING' }).status).toBe('WAITING');
    expect(normalizeBattle({ status: 'PENDING' }).status).toBe('WAITING');
    expect(normalizeBattle({ status: 'ACTIVE' }).status).toBe('IN_PROGRESS');
    expect(normalizeBattle({ status: 'CANCELED' }).status).toBe('CANCELLED');
    expect(normalizeBattle({ status: 'lobby' }).status).toBe('LOBBY');
  });

  it('defaults unknown/absent status to WAITING, never crashes', () => {
    expect(normalizeBattle({}).status).toBe('WAITING');
    expect(normalizeBattle({ status: 'GARBAGE' }).status).toBe('WAITING');
    expect(normalizeBattle({ status: null }).status).toBe('WAITING');
  });

  it('maps legacy battle types and defaults to QUICK', () => {
    expect(normalizeBattle({ type: 'INSTANT' }).type).toBe('QUICK');
    expect(normalizeBattle({ type: 'TOURNAMENT' }).type).toBe('QUICK');
    expect(normalizeBattle({ type: 'practice' }).type).toBe('PRACTICE');
    expect(normalizeBattle({ type: undefined }).type).toBe('QUICK');
  });

  it('clamps difficulty to the three known values', () => {
    expect(normalizeBattle({ difficulty: 'easy' }).difficulty).toBe('EASY');
    expect(normalizeBattle({ difficulty: 'IMPOSSIBLE' }).difficulty).toBe(
      'MEDIUM',
    );
  });

  it('accepts snake_case AND camelCase payloads identically', () => {
    const snake = normalizeBattle({
      user_id: 'u1',
      max_participants: 4,
      created_at: 't1',
    });
    const camel = normalizeBattle({
      userId: 'u1',
      maxParticipants: 4,
      createdAt: 't1',
    });
    expect(camel.user_id).toBe(snake.user_id);
    expect(camel.max_participants).toBe(snake.max_participants);
    expect(camel.created_at).toBe(snake.created_at);
  });

  it('derives current_participants from _count when the flat fields are absent', () => {
    expect(
      normalizeBattle({ _count: { participants: 3 } }).current_participants,
    ).toBe(3);
  });

  it('normalizes nested participants and defaults their numerics to 0', () => {
    const b = normalizeBattle({ participants: [{ id: 7, userId: 'u9' }] });
    expect(b.participants).toHaveLength(1);
    expect(b.participants[0].id).toBe('7'); // coerced to string
    expect(b.participants[0].user_id).toBe('u9');
    expect(b.participants[0].score).toBe(0);
    expect(b.participants[0].status).toBe('JOINED');
  });

  it('non-array participants become an empty array, not a crash', () => {
    expect(normalizeBattle({ participants: 'oops' }).participants).toEqual([]);
  });
});

describe('normalizeBattleParticipant — user fallbacks', () => {
  it('falls back to flat fields when the nested user is missing', () => {
    const p = normalizeBattleParticipant({
      user_id: 'u1',
      username: 'neo',
      avatar_url: 'a.png',
    });
    expect(p.user.username).toBe('neo');
    expect(p.user.avatar_url).toBe('a.png');
    expect(p.user.id).toBe('u1');
  });

  it('unknown user renders as "Unknown", not undefined', () => {
    expect(normalizeBattleParticipant({}).user.username).toBe('Unknown');
  });
});
