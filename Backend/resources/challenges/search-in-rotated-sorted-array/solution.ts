// Optimal O(log n) Time, O(1) Space — Binary Search
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // Left sorted portion check
    if (nums[left] <= nums[mid]) {
      // Check if target is perfectly within the left sorted boundaries
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1; 
      } else {
        left = mid + 1; 
      }
    } 
    // Right sorted portion check
    else {
      // Check if target is perfectly within the right sorted boundaries
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1; 
      } else {
        right = mid - 1; 
      }
    }
  }

  return -1;
}
