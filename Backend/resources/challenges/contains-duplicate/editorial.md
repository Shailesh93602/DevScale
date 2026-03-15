# Editorial — Contains Duplicate

## Problem Summary

Given an array of integers, figure out if any number appears more than once. If all numbers are distinct, return `false`. Otherwise, return `true`.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Check every possible pair of elements. If you find two that are equal, return `true`.

```typescript
function containsDuplicate(nums: number[]): boolean {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] === nums[j]) {
        return true;
      }
    }
  }
  return false;
}
```

**Complexity:**
- Time: **O(n²)** — Comparing every pair of elements.
- Space: **O(1)**

---

## Approach 2 — Sorting (O(n log n) time, O(1) space)

If there are duplicate numbers, they will be adjacent to each other after the array is sorted.

```typescript
function containsDuplicate(nums: number[]): boolean {
  nums.sort((a, b) => a - b);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      return true;
    }
  }
  return false;
}
```

**Complexity:**
- Time: **O(n log n)** — We sort the array first, which dominates the time.
- Space: **O(1)** or **O(n)** — Depending on the sorting algorithm implementation (V8 uses Timsort which is O(n) space).

---

## Approach 3 — Hash Set (Optimal approach, O(n) time, O(n) space)

We can use a Hash Set to store elements we've seen so far. For each element, we check if it's already in the set. If it is, we found a duplicate! If not, we add it to the set and continue.

```typescript
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
}
```

**One-Liner Variant:**
In modern programming languages, constructing a Set from an array removes all duplicates. If the size of the set is smaller than the size of the original array, we know there were duplicates.

```typescript
function containsDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}
```

**Complexity:**
- Time: **O(n)** — Average case for Hash Set insertion and lookup is O(1). We do this `n` times.
- Space: **O(n)** — In the worst-case (no duplicates), we store every element in the Hash Set.

---

## Summary

- Use **Hash Set** for the optimal O(n) runtime if you can afford O(n) memory.
- Use **Sorting** if memory is strictly constrained (and your sort is in-place), trading off some speed for memory.
