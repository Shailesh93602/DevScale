/* eslint-disable @typescript-eslint/no-explicit-any */
type Timer = ReturnType<typeof setTimeout>;

export function debounce<T extends any[]>(
  callback: (...args: T) => void,
  delay: number = 300,
) {
  let timer: Timer;

  return function (...args: T): void {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
