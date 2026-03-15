# Editorial — 3Sum

## Problem Summary

Given an integer array `nums`, find all the unique triplets `[nums[i], nums[j], nums[k]]` such that `nums[i] + nums[j] + nums[k] === 0`. The trick is that the **solution set must not contain duplicate triplets**, meaning `[0, -1, 1]` and `[1, 0, -1]` are considered identical and should only be pushed to the result array once.

---

## Approach 1 — Brute Force (Time Limit Exceeded)

Check every possible triplet combination. If they sum to 0, sort the triplet itself and add it to a Set tracking unique combinations.

```typescript
function threeSum(nums: number[]): number[][] {
  const resultObj: { [key: string]: number[] } = {};

  for (let i = 0; i < nums.length - 2; i++) {
    for (let j = i + 1; j < nums.length - 1; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] + nums[j] + nums[k] === 0) {
          const triplet = [nums[i], nums[j], nums[k]].sort((a, b) => a - b);
          resultObj[triplet.toString()] = triplet;
        }
      }
    }
  }

  return Object.values(resultObj);
}
```

**Complexity:**
- Time: **O(n³)** — In polynomial time scaling to degree 3. For 3,000 items, this is up to 27 billion operations, massively exceeding the time limit constraints.
- Space: **O(n)** — For tracking the hash set.

---

## Approach 2 — Sorting + Two Pointers (Optimal O(n²) Time)

Let's rethink 3Sum by turning it into a 2Sum problem. If we sort the initial array:
1. We can loop through the array once, picking a fixed anchor value `nums[i]`.
2. The remaining target to hit 0 becomes `-nums[i]`.
3. Because the remainder of the array is optimally sorted, finding two numbers that sum to `-nums[i]` is identical to `Two Sum II` using a two-pointer approach sliding inward.

### Handling Duplicates
Sorting provides another crucial advantage: skipping duplicates easily. 
- During our outer loop `i`, if `nums[i] === nums[i - 1]`, we can skip it, because we already analyzed exactly this anchor value on the previous tick.
- During our inner two-pointer search loop, if we find a valid triplet at `nums[left]` and `nums[right]`, we must advance `left` until we stop seeing its identical sibling value (and alternatively decrement `right` past its sibling values). This absolutely guarantees no duplicated arrays.

```typescript
function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const result: number[][] = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // If our lowest anchor is greater than 0, there is no way we can ever reach 0 target
    if (nums[i] > 0) break;
    
    // Skip duplicate anchors
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      let sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}
```

**Complexity:**
- Time: **O(n²)** — A single outer loop anchors `i`, and the inner two-pointer scan shrinks the remaining elements in roughly `O(n)` time exactly once. `O(n) * O(n)`. The sorting step takes `O(n log n)`, which is heavily dominated by the O(n²) loop.
- Space: Generally **O(1)** or **O(log n)** depending on the built-in Sorting algorithm overhead, plus the required array for outputting the results. 
