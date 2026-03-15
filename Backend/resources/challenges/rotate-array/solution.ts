// Triple Reverse — O(n) Time, O(1) Space
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = k % n;
  
  const reverse = (start: number, end: number) => {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++; end--;
    }
  };

  reverse(0, n - 1);  // Reverse entire array
  reverse(0, k - 1);  // Reverse first k elements
  reverse(k, n - 1);  // Reverse remaining elements
}
