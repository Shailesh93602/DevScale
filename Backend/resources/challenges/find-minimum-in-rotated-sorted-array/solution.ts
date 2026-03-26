// Optimal O(log n) Time, O(1) Space — Binary Search
function findMin(nums: number[]): number {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    let mid = Math.floor((left + right) / 2);

    if (nums[mid] > nums[right]) {
      // The min must be to the right
      left = mid + 1;
    } else {
      // The min is to the left, or it's the current mid
      right = mid;
    }
  }

  // left and right converge on the minimum element
  return nums[left];
}
