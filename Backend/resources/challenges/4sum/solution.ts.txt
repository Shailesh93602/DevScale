/**
 * Optimal Solution: O(n^3) Time, O(1) extra space (excluding result).
 * Sort the array and use two nested loops to fix the first two elements,
 * then use two pointers to find the remaining two.
 */
export function fourSum(nums: number[], target: number): number[][] {
  const result: number[][] = [];
  const n = nums.length;
  if (n < 4) return result;

  nums.sort((a, b) => a - b);

  for (let i = 0; i < n - 3; i++) {
    // Avoid duplicates for the first element
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    // Pruning: smallest possible sum with current nums[i]
    if (nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3] > target) break;
    // Pruning: largest possible sum with current nums[i]
    if (nums[i] + nums[n - 3] + nums[n - 2] + nums[n - 1] < target) continue;

    for (let j = i + 1; j < n - 2; j++) {
      // Avoid duplicates for the second element
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;

      // Pruning: smallest possible sum with current nums[i], nums[j]
      if (nums[i] + nums[j] + nums[j + 1] + nums[j + 2] > target) break;
      // Pruning: largest possible sum with current nums[i], nums[j]
      if (nums[i] + nums[j] + nums[n - 2] + nums[n - 1] < target) continue;

      let left = j + 1;
      let right = n - 1;

      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];
        if (sum === target) {
          result.push([nums[i], nums[j], nums[left], nums[right]]);
          
          // Avoid duplicates for the third and fourth elements
          while (left < right && nums[left] === nums[left + 1]) left++;
          while (left < right && nums[right] === nums[right - 1]) right--;
          
          left++;
          right--;
        } else if (sum < target) {
          left++;
        } else {
          right--;
        }
      }
    }
  }

  return result;
}
