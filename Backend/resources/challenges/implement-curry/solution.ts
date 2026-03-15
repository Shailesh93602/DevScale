/**
 * Implement Curry Function
 *
 * Transforms a function so it can be called with arguments
 * one at a time or in groups until all are provided.
 *
 * Time: O(n) per call chain where n = fn.length
 * Space: O(n) for accumulated arguments
 */
function curry(fn: (...args: any[]) => any): (...args: any[]) => any {
  return function curried(...args: any[]): any {
    // If we have enough arguments, call the original function
    if (args.length >= fn.length) {
      return fn(...args);
    }
    // Otherwise, return a function that collects more arguments
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  };
}

export { curry };
