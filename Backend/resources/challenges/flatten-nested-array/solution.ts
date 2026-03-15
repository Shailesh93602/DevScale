/**
 * Flatten a Nested Array
 *
 * Recursively flattens a nested array up to the specified depth.
 * Defaults to complete flattening (Infinity depth).
 *
 * Time: O(n) where n = total elements
 * Space: O(n) for result + O(d) recursion depth
 */
function flatten(arr: any[], depth: number = Infinity): any[] {
  const result: any[] = [];

  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      // Recurse with reduced depth
      result.push(...flatten(item, depth - 1));
    } else {
      result.push(item);
    }
  }

  return result;
}

export { flatten };
