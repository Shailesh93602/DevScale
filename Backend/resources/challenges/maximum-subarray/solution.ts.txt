// Optimal O(n) Time, O(1) Space — Kadane's Algorithm
function maxSubArray(nums: number[]): number {
  let max_so_far = nums[0];
  let current_max = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // Should we add the current element to the existing sum, 
    // or is it better to start a new contiguous subarray from here?
    current_max = Math.max(nums[i], current_max + nums[i]);
    max_so_far = Math.max(max_so_far, current_max);
  }
  
  return max_so_far;
}
