// Optimal O(n) Time, O(1) Space — Two Pointer strategy
function trap(height: number[]): number {
  if (height.length === 0) return 0;
  
  let left = 0;
  let right = height.length - 1;
  let maxLeft = 0;
  let maxRight = 0;
  let trapped = 0;
  
  while (left < right) {
    // If left's max height is smaller than right's, we know the bottleneck is on the left
    if (height[left] <= height[right]) {
      if (height[left] >= maxLeft) {
        maxLeft = height[left];
      } else {
        trapped += maxLeft - height[left];
      }
      left++;
    } 
    // Otherwise, the bottleneck must be on the right side
    else {
      if (height[right] >= maxRight) {
        maxRight = height[right];
      } else {
        trapped += maxRight - height[right];
      }
      right--;
    }
  }
  
  return trapped;
}
