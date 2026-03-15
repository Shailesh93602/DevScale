# Find Peak Element

A peak element is an element that is strictly greater than its neighbors.

Given a **0-indexed** integer array `nums`, find a peak element, and return its index. If the array contains multiple peaks, return the index to **any** of the peaks.

You may imagine that `nums[-1] = nums[n] = -infinity`. In other words, an element is always considered to be strictly greater than a neighbor that is outside the array.

You must write an algorithm that runs in **O(log n)** time.

---

## Examples

**Example 1:**
```
Input: nums = [1,2,3,1]
Output: 2
Explanation: 3 is a peak element and your function should return index 2.
```

**Example 2:**
```
Input: nums = [1,2,1,3,5,6,4]
Output: 5
Explanation: Your function can return either index 1 (value 2) or index 5 (value 6). Index 5 is returned.
```

**Example 3:**
```
Input: nums = [1]
Output: 0
Explanation: Single element is always a peak.
```

---

## Constraints

- `1 <= nums.length <= 1000`
- `-2^31 <= nums[i] <= 2^31 - 1`
- `nums[i] != nums[i + 1]` for all valid `i`.
