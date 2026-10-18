function searchRange(nums: number[], target: number): number[] {
  const findBound = (isFirst: boolean) => {
    let left = 0, right = nums.length - 1;
    let bound = -1;
    
    while (left <= right) {
      const mid = Math.floor(left + (right - left) / 2);
      if (nums[mid] === target) {
        bound = mid;
        if (isFirst) {
          right = mid - 1; // Look left for earlier occurrence
        } else {
          left = mid + 1; // Look right for later occurrence
        }
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return bound;
  };
  
  return [findBound(true), findBound(false)];
}
