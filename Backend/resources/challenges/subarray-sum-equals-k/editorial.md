# Editorial — Subarray Sum Equals K

## Problem Summary

Count how many contiguous subarrays sum to exactly `k`. Since the array can have negative numbers, a two-pointer/sliding window won't work — we need prefix sums with a hash map.

---

## Approach 1 — Brute Force (O(n²))

Check every subarray explicitly:

```typescript
function subarraySum(nums: number[], k: number): number {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum === k) count++;
    }
  }
  return count;
}
```

**Complexity:** Time **O(n²)**, Space **O(1)**

---

## Approach 2 — Prefix Sum + HashMap (Optimal O(n))

**Key mathematical insight:** `sum(i..j) = prefixSum[j+1] - prefixSum[i]`

If `prefixSum[j+1] - prefixSum[i] === k`, then `prefixSum[i] === prefixSum[j+1] - k`.

So as we build the running prefix sum, we check: *how many times have we seen `currentSum - k` before?* Each occurrence represents a valid subarray ending at the current position.

```typescript
function subarraySum(nums: number[], k: number): number {
  // Map from prefix sum → how many times we've seen it
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1); // Empty prefix (sum = 0) seen once
  
  let count = 0;
  let currentSum = 0;
  
  for (const num of nums) {
    currentSum += num;
    
    // If (currentSum - k) was seen before, those are valid subarrays ending here
    count += prefixCount.get(currentSum - k) ?? 0;
    
    // Record the current prefix sum
    prefixCount.set(currentSum, (prefixCount.get(currentSum) ?? 0) + 1);
  }
  
  return count;
}
```

**Why initialize `{0: 1}`?** For subarrays starting from index 0, when `currentSum === k`, we need `currentSum - k = 0` to already be in the map — that's the "empty prefix" base case.

**Complexity:**
- Time: **O(n)** — Single pass.
- Space: **O(n)** — HashMap storing at most `n` prefix sums.
