# Editorial — Jump Game II

## Problem Summary

Find the minimum number of jumps needed to reach the last index, where each element represents the maximum jump length from that position.

---

## Approach 1 — Dynamic Programming (O(n^2) time, O(n) space)

For each position, compute the minimum jumps needed. For each reachable position, update all positions within its jump range.

```typescript
function jump(nums: number[]): number {
  const n = nums.length;
  const dp: number[] = new Array(n).fill(Infinity);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= nums[i] && i + j < n; j++) {
      dp[i + j] = Math.min(dp[i + j], dp[i] + 1);
    }
  }

  return dp[n - 1];
}
```

**Complexity:**
- Time: **O(n^2)** — nested iteration.
- Space: **O(n)** — DP array.

---

## Approach 2 — BFS / Greedy (O(n) time, O(1) space) ✅ Optimal

Think of it as BFS on levels. Each "level" represents positions reachable with the same number of jumps. Track the current level's boundary (`curEnd`) and the farthest reachable position (`farthest`). When you reach `curEnd`, increment jumps and set `curEnd = farthest`.

```typescript
function jump(nums: number[]): number {
  let jumps = 0;
  let curEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === curEnd) {
      jumps++;
      curEnd = farthest;
      if (curEnd >= nums.length - 1) break;
    }
  }

  return jumps;
}
```

**Complexity:**
- Time: **O(n)** — single pass.
- Space: **O(1)** — constant extra space.

---

## Key Insight

This is a BFS-level traversal in disguise. Each "level" is the set of indices reachable with exactly `k` jumps. By tracking the farthest reach within each level, we implicitly explore all nodes at each BFS level without actually using a queue.
