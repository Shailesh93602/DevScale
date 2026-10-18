/**
 * Deep Clone an Object
 *
 * Recursively creates a deep copy of any value, handling
 * primitives, objects, arrays, Date, RegExp, and circular references.
 *
 * Time: O(n) where n = total properties
 * Space: O(n)
 */
function deepClone<T>(obj: T, seen = new WeakMap()): T {
  // Primitives and null — return as-is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Circular reference check
  if (seen.has(obj as object)) {
    return seen.get(obj as object);
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T;
  }

  // Array
  if (Array.isArray(obj)) {
    const arrClone: any[] = [];
    seen.set(obj as object, arrClone);
    for (const item of obj) {
      arrClone.push(deepClone(item, seen));
    }
    return arrClone as unknown as T;
  }

  // Plain object
  const clone = Object.create(Object.getPrototypeOf(obj));
  seen.set(obj as object, clone);
  for (const key of Object.keys(obj)) {
    clone[key] = deepClone((obj as any)[key], seen);
  }
  return clone;
}

export { deepClone };
