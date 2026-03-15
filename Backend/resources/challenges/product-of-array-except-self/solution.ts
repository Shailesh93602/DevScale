// Optimal approach O(n) Time, O(1) Extra Space
function productExceptSelf(nums: number[]): number[] {
  const n = nums.length;
  // Initialize the result array where ans[i] will store product
  // of all elements to the left of i initially.
  const ans = new Array(n).fill(1);

  // 1. Calculate the product of elements to the LEFT of ans[i]
  let leftProduct = 1;
  for (let i = 0; i < n; i++) {
    ans[i] = leftProduct;
    leftProduct *= nums[i]; // Multiply current element into accumulator
  }

  // 2. Multiply ans[i] with the product of elements to the RIGHT of ans[i]
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    // Current left product * right product accumulator
    ans[i] *= rightProduct; 
    rightProduct *= nums[i]; // Multiply current element into accumulator
  }

  return ans;
}
