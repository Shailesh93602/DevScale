/**
 * Backtracking Solution.
 * Time Complexity: O(2^N) in worst case as we explore combinations.
 * Space Complexity: O(N) for recursion stack.
 */
export function combinationSum2(candidates: number[], target: number): number[][] {
  const results: number[][] = [];
  candidates.sort((a, b) => a - b);

  function backtrack(remaining: number, start: number, path: number[]) {
    if (remaining === 0) {
      results.push([...path]);
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      // Small optimization: stop if current number is already greater than remaining target
      if (candidates[i] > remaining) break;

      // Skip duplicates at the same recursion level
      if (i > start && candidates[i] === candidates[i - 1]) continue;

      path.push(candidates[i]);
      // Use i + 1 because each number can be used only once
      backtrack(remaining - candidates[i], i + 1, path);
      path.pop();
    }
  }

  backtrack(target, 0, []);
  return results;
}
