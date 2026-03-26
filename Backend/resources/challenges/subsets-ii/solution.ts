function subsetsWithDup(nums: number[]): number[][] {
  const result: number[][] = [];
  nums.sort((a, b) => a - b);

  function backtrack(startIndex: number, current: number[]) {
    result.push([...current]);

    for (let i = startIndex; i < nums.length; i++) {
      // If the current element is the same as the previous one AND
      // we are not at the start of the current level of branches, skip it.
      if (i > startIndex && nums[i] === nums[i - 1]) {
        continue;
      }

      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}
