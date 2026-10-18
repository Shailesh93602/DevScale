function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length;
  const result: number[] = new Array(n).fill(-1);
  const stack: number[] = []; // store indices
  
  // We iterate up to 2 * n to simulate the circular array
  for (let i = 0; i < 2 * n; i++) {
    const num = nums[i % n];
    
    while (stack.length > 0 && nums[stack[stack.length - 1]] < num) {
      const idx = stack.pop()!;
      result[idx] = num;
    }
    
    // Only push index in the first pass
    if (i < n) {
      stack.push(i);
    }
  }
  
  return result;
}
