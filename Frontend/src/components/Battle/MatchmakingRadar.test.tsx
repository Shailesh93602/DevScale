import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchmakingRadar } from './MatchmakingRadar';

const props = {
  elapsedSeconds: 30,
  queueSize: 2,
  userRating: 1200,
  error: null,
  onJoin: vi.fn(),
  onLeave: vi.fn(),
  onRetry: vi.fn(),
};

// The server computes the band once, at join (matchmakingService.tryMatch); nothing widens it.
describe('MatchmakingRadar copy', () => {
  it('does not promise a widening search band while queuing', () => {
    render(<MatchmakingRadar phase="queuing" {...props} />);
    expect(screen.queryByText(/Search Range/)).toBeNull();
    expect(screen.queryByText(/expands|expanding/i)).toBeNull();
    expect(screen.getByText(/Matching runs when you join/)).toBeInTheDocument();
  });

  it('does not promise an expanding band on the idle card', () => {
    render(<MatchmakingRadar phase="idle" {...props} />);
    expect(screen.queryByText(/expanding rating band/)).toBeNull();
  });
});
