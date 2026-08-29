import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './common';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires once with the LAST arguments after the delay', () => {
    const spy = vi.fn();
    const d = debounce(spy, 300);
    d('a');
    d('b');
    d('c');
    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('a call inside the window restarts the timer', () => {
    const spy = vi.fn();
    const d = debounce(spy, 300);
    d('x');
    vi.advanceTimersByTime(200);
    d('y');
    vi.advanceTimersByTime(200);
    expect(spy).not.toHaveBeenCalled(); // 400ms elapsed, but window restarted
    vi.advanceTimersByTime(100);
    expect(spy).toHaveBeenCalledWith('y');
  });

  it('defaults to 300ms', () => {
    const spy = vi.fn();
    debounce(spy)();
    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
