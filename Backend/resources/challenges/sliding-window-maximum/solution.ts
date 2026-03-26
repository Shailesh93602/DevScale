function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = [];
  const deque: number[] = []; // Stores indices

  for (let i = 0; i < nums.length; i++) {
    // Remove indices that are out of the current window
    if (deque.length > 0 && deque[0] === i - k) {
      deque.shift();
    }

    // Maintain monotonic property: 
    // Remove smaller elements from back as they can't be max
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // After first window, record the max (always at front)
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}
