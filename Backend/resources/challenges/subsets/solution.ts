export function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(index: number) {
    if (index === nums.length) {
      result.push([...current]);
      return;
    }

    // Choice 1: Include nums[index]
    current.push(nums[index]);
    backtrack(index + 1);
    current.pop();

    // Choice 2: Don't include nums[index]
    backtrack(index + 1);
  }

  backtrack(0);
  return result;
}
