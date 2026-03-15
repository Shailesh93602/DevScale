# Editorial — Longest Increasing Subsequence

## Problem Summary

Find the length of the longest strictly increasing subsequence in an array.

---

## Approach 1 — DP O(n^2)

Define `dp[i]` = length of LIS ending at index `i`. For each `i`, check all `j < i` where `nums[j] < nums[i]`.

```typescript
function lengthOfLIS(nums: number[]): number {
  const n = nums.length;
  const dp: number[] = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}
```

**Complexity:**
- Time: **O(n^2)**
- Space: **O(n)**

---

## Approach 2 — Binary Search with Patience Sorting (Optimal) ✅

Maintain an array `tails` where `tails[i]` is the smallest tail element for an increasing subsequence of length `i+1`. Use binary search to find the position to update.

```typescript
function lengthOfLIS(nums: number[]): number {
  const tails: number[] = [];

  for (const num of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < num) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    tails[lo] = num;
  }

  return tails.length;
}
```

**Complexity:**
- Time: **O(n log n)** — For each element, binary search takes O(log n).
- Space: **O(n)** — The tails array.

---

## Key Insight

The `tails` array does not represent the actual LIS, but its length equals the LIS length. By maintaining the invariant that `tails` is always sorted and replacing elements greedily, we ensure the longest possible subsequence. This is known as the Patience Sorting algorithm.
