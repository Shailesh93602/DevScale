/**
 * Implement Throttle
 *
 * Creates a throttled version of a function that fires at most once
 * per `interval` ms, with both leading and trailing edge support.
 *
 * Time: O(1) per call
 * Space: O(1)
 */
function throttle(
  fn: (...args: any[]) => void,
  interval: number
): (...args: any[]) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;
  let lastThis: any = null;

  return function (this: any, ...args: any[]) {
    const now = Date.now();
    const remaining = interval - (now - lastCallTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      // Leading edge: enough time passed, fire immediately
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      fn.apply(this, args);
    } else if (timeoutId === null) {
      // Trailing edge: schedule for remaining time
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        fn.apply(lastThis, lastArgs!);
        lastArgs = null;
        lastThis = null;
      }, remaining);
    }
  };
}

export { throttle };
