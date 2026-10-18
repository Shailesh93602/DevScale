/**
 * Memoize Function
 *
 * Wraps a function to cache results based on arguments.
 * Uses JSON.stringify for cache key generation.
 *
 * Time: O(1) amortized lookup
 * Space: O(n) for n unique argument combinations
 */
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();

  return function (this: any, ...args: any[]) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  } as T;
}

export { memoize };
