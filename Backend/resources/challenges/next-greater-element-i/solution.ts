function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
  const map: Map<number, number> = new Map();
  const stack: number[] = [];
  
  // Build a map of each element in nums2 to its next greater element
  // Use a Monotonic Decreasing Stack
  for (let num of nums2) {
    while (stack.length > 0 && stack[stack.length - 1] < num) {
      const smaller = stack.pop()!;
      map.set(smaller, num);
    }
    stack.push(num);
  }
  
  // For elements remaining on stack, there is no next greater element
  while (stack.length > 0) {
    map.set(stack.pop()!, -1);
  }
  
  // Map nums1 elements to their answers pre-calculated from nums2
  return nums1.map(n => map.get(n)!);
}
