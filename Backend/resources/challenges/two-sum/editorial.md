# Editorial — Two Sum

## Problem Summary

Find two indices in an array such that their values sum to `target`. One valid answer is guaranteed to exist.

---

## Approach 1 — Brute Force (O(n²) time, O(1) space)

Check every pair `(i, j)` where `i < j`.

```typescript
function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return []; // guaranteed not to reach here
}
```

**Complexity:**
- Time: **O(n²)** — nested loops.
- Space: **O(1)** — no extra data structure.

**Downside:** Too slow for large inputs (n = 10^4 → 10^8 operations).

---

## Approach 2 — Hash Map, Two-Pass (O(n) time, O(n) space)

First pass: store all `(value → index)` in a map.  
Second pass: for each `nums[i]`, look up `target - nums[i]` in the map, ensuring it's not the same index.

```typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();

  // First pass: populate map
  for (let i = 0; i < nums.length; i++) {
    map.set(nums[i], i);
  }

  // Second pass: find complement
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement) && map.get(complement) !== i) {
      return [i, map.get(complement)!];
    }
  }

  return [];
}
```

**Complexity:**
- Time: **O(n)** — two linear scans.
- Space: **O(n)** — hash map storing up to n entries.

---

## Approach 3 — Hash Map, Single-Pass ✅ (Optimal)

As we iterate, we check if the complement of the current element already exists in the map. If yes, we've found our pair. If not, we add the current element to the map and continue.

This works because the problem guarantees exactly one answer — by the time we reach the second element of the pair, the first will already be in the map.

```typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }

    map.set(nums[i], i);
  }

  return []; // guaranteed not to reach here
}
```

**Complexity:**
- Time: **O(n)** — single pass through the array.
- Space: **O(n)** — hash map in worst case stores all elements.

---

## Why This Works

For each element `nums[i]`, we need `nums[j] = target - nums[i]`. Instead of scanning the array again (O(n)), we check a hash map in O(1).

By adding to the map **after** checking the complement, we automatically avoid using the same element twice (e.g., target=6, nums=[3,3] — when we're at index 1 (value 3), complement 3 is already at index 0 in the map).

---

## Key Insight

This is the classic **"complement lookup"** technique: transform a nested search problem into a single-pass by storing previously seen values.

**Generalizations of this pattern:**
- Three Sum (two pointers after sorting, or map after fixing one element)
- Subarray Sum Equals K (prefix sum + hash map)
- Two Sum II (two pointers on sorted array)
