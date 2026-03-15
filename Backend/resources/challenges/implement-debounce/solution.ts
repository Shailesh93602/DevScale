/**
 * Implement Debounce
 *
 * Creates a debounced version of a function that delays invocation
 * until after `delay` ms have elapsed since the last call.
 *
 * Time: O(1) per call
 * Space: O(1)
 */
function debounce(
  fn: (...args: any[]) => void,
  delay: number
): (...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: any[]) {
    // Clear the previous timer if one exists
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timer — fn will only be called if no new invocations
    // happen within the delay window
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

export { debounce };
