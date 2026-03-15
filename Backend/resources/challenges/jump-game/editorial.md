# Editorial — Jump Game

## Problem Summary

Determine whether you can reach the last index of an array, starting from index 0, where each element represents the maximum jump length from that position.

---

## Approach 1 — Dynamic Programming (O(n^2) time, O(n) space)

Create a boolean array `dp` where `dp[i]` means index `i` is reachable. For each reachable index, mark all positions within its jump range as reachable.

```typescript
function canJump(nums: number[]): boolean {
  const n = nums.length;
  const dp: boolean[] = new Array(n).fill(false);
  dp[0] = true;

  for (let i = 0; i < n; i++) {
    if (!dp[i]) continue;
    for (let j = 1; j <= nums[i] && i + j < n; j++) {
      dp[i + j] = true;
    }
    if (dp[n - 1]) return true;
  }

  return dp[n - 1];
}
```

**Complexity:**
- Time: **O(n^2)** — for each index, we may iterate up to `nums[i]` positions.
- Space: **O(n)** — boolean DP array.

---

## Approach 2 — Greedy (O(n) time, O(1) space) ✅ Optimal

Track the farthest index you can reach. Iterate through the array; at each position, update the farthest reachable index. If at any point the current index exceeds the farthest reachable, return false.

```typescript
function canJump(nums: number[]): boolean {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) return true;
  }

  return true;
}
```

**Complexity:**
- Time: **O(n)** — single pass through the array.
- Space: **O(1)** — only a single variable.

---

## Key Insight

You don't need to track every possible path. You only need to know the farthest position reachable so far. If you can reach position `i`, then you can potentially reach up to position `i + nums[i]`. The greedy approach works because reaching a farther position never makes things worse — it only opens up more options.
