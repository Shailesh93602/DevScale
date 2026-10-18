export function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(index: number, currentSum: number) {
    if (currentSum === target) {
      result.push([...current]);
      return;
    }
    if (index >= candidates.length || currentSum > target) {
      return;
    }

    // Choice 1: Include the current candidate again
    current.push(candidates[index]);
    backtrack(index, currentSum + candidates[index]);
    current.pop();

    // Choice 2: Skip this candidate
    backtrack(index + 1, currentSum);
  }

  backtrack(0, 0);
  return result;
}
