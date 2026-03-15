# Editorial — Longest Consecutive Sequence

## Problem Summary

Find the length of the longest sequence of consecutive integers in an unsorted array. Must run in O(n).

---

## Approach 1 — Sorting (O(n log n))

Sort the array and scan for consecutive runs. Simple but violates time constraint.

---

## Approach 2 — HashSet (Optimal O(n))

**Key insight:** Put all numbers into a Set for O(1) lookup. Only start counting from numbers that are sequence STARTERS (i.e., `num - 1` is not in the Set). For each starter, count upward while consecutive numbers exist.

This works in O(n) because each number is visited at most twice — once to check if it's a start, and once when counting a sequence from its starter.

```typescript
function longestConsecutive(nums: number[]): number {
  const numSet = new Set<number>(nums);
  let longest = 0;

  for (const num of numSet) {
    // Only start a sequence from a sequence start
    if (!numSet.has(num - 1)) {
      let current = num;
      let length = 1;

      while (numSet.has(current + 1)) {
        current++;
        length++;
      }

      longest = Math.max(longest, length);
    }
  }

  return longest;
}
```

**Complexity:**
- Time: **O(n)** — Each number is touched at most twice (once in outer loop, once in inner while loop across all iterations total).
- Space: **O(n)** — The HashSet stores all n numbers.
