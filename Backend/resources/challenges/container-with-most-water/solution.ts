// Optimal O(n) Time, O(1) Space — Two Pointer Greedy strategy
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let max_water = 0;

  while (left < right) {
    const width = right - left;
    const current_water = Math.min(height[left], height[right]) * width;
    
    max_water = Math.max(max_water, current_water);

    // Greedy decision: throw away the shorter edge!
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return max_water;
}
