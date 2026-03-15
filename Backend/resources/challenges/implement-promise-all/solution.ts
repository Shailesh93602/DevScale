/**
 * Implement Promise.all
 *
 * Resolves when all promises resolve, rejects on first rejection.
 * Results maintain input order.
 *
 * Time: O(n) setup
 * Space: O(n) for results
 */
function promiseAll<T>(promises: Array<T | Promise<T>>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    // Empty array resolves immediately
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results: T[] = new Array(promises.length);
    let resolvedCount = 0;

    promises.forEach((promise, index) => {
      // Wrap with Promise.resolve to handle non-promise values
      Promise.resolve(promise).then(
        (value) => {
          results[index] = value; // Store at correct index for ordering
          resolvedCount++;
          if (resolvedCount === promises.length) {
            resolve(results);
          }
        },
        (reason) => {
          reject(reason); // Reject immediately on first failure
        }
      );
    });
  });
}

export { promiseAll };
