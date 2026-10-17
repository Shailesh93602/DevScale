import { describe, it, expect } from 'vitest';
import { isValidEventData } from './helpers';

describe('isValidEventData', () => {
  it('accepts a valid chat:message payload', () => {
    expect(
      isValidEventData('chat:message', {
        id: 'm1',
        content: 'hi',
        senderId: 'u1',
        timestamp: '2026-10-17T00:00:00Z',
      }),
    ).toBe(true);
  });

  it('rejects a malformed or envelope-shaped payload', () => {
    expect(isValidEventData('chat:message', { content: 'hi' })).toBe(false);
    expect(isValidEventData('chat:message', { type: 'x', data: 5 })).toBe(
      false,
    );
  });
});
