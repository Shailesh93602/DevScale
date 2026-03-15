// Optimal O(n) Time, O(1) Space — keeping track of min and max products
function maxProduct(nums: number[]): number {
  if (nums.length === 0) return 0;
  
  let max_so_far = nums[0];
  let min_so_far = nums[0];
  let result = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    let curr = nums[i];
    
    // When curr is negative, the potential maximum becomes the minimum, and vice versa.
    if (curr < 0) {
      let temp = max_so_far;
      max_so_far = min_so_far;
      min_so_far = temp;
    }
    
    max_so_far = Math.max(curr, max_so_far * curr);
    min_so_far = Math.min(curr, min_so_far * curr);
    
    result = Math.max(result, max_so_far);
  }
  
  return result;
}
