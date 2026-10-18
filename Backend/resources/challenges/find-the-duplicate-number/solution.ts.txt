// O(n) Time, O(1) Space — Floyd's Cycle Detection
function findDuplicate(nums: number[]): number {
  let slow = nums[0];
  let fast = nums[nums[0]];

  // Phase 1: Find the intersection point
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[nums[fast]];
  }

  // Phase 2: Find the cycle entrance
  let start = 0;
  while (start !== slow) {
    start = nums[start];
    slow = nums[slow];
  }

  return slow;
}
