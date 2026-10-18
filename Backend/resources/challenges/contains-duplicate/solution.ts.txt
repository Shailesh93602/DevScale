// Optimal Hash Set approach: O(n) Time, O(n) Space
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  
  return false;
}

// Alternative one-liner:
// return new Set(nums).size !== nums.length;
