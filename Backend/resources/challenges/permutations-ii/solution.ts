function permuteUnique(nums: number[]): number[][] {
  const result: number[][] = [];
  const used = new Array(nums.length).fill(false);
  nums.sort((a, b) => a - b);

  function backtrack(current: number[]) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      // Duplicate handling: skip if the current element is the same as the previous 
      // AND the previous element has NOT been used yet in this recursive branch.
      // This ensures we only use the first instance of a duplicate as the head of a branch.
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;

      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }

  backtrack([]);
  return result;
}
