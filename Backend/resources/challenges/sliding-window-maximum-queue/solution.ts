function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // Stores indices

  for (let i = 0; i < nums.length; i++) {
    // 1. Remove indices that are out of the window
    if (deque.length > 0 && deque[0] === i - k) {
      deque.shift();
    }

    // 2. Remove indices of elements smaller than the current element
    // This maintains the monotonic property (elements in deque are in descending order)
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // 3. The first element in the deque is the maximum for the current window
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
