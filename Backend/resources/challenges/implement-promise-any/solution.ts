/**
 * Implement Promise.any
 *
 * Resolves with the first fulfilled value, or rejects with
 * AggregateError if all promises reject.
 *
 * Time: O(n) setup
 * Space: O(n) for errors array
 */
function promiseAny<T>(promises: Array<T | Promise<T>>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }

    const errors: any[] = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        (value) => {
          resolve(value); // First success wins
        },
        (reason) => {
          errors[index] = reason;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
}

export { promiseAny };
