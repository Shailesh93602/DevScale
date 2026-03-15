# Editorial — Climbing Stairs

## Problem Summary

Given `n` steps, find the number of distinct ways to reach the top by taking 1 or 2 steps at a time. This is equivalent to computing the (n+1)th Fibonacci number.

---

## Approach 1 — Recursion (Brute Force)

At each step, we can either take 1 step or 2 steps. The total ways from step `i` is the sum of ways from step `i+1` and step `i+2`.

```typescript
function climbStairs(n: number): number {
  if (n <= 1) return 1;
  return climbStairs(n - 1) + climbStairs(n - 2);
}
```

**Complexity:**
- Time: **O(2^n)** — Exponential due to overlapping subproblems.
- Space: **O(n)** — Recursion stack depth.

---

## Approach 2 — Dynamic Programming (Bottom-Up)

Build up the solution from base cases. `dp[i]` represents the number of ways to reach step `i`.

```typescript
function climbStairs(n: number): number {
  if (n <= 2) return n;
  const dp: number[] = new Array(n + 1);
  dp[1] = 1;
  dp[2] = 2;
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
```

**Complexity:**
- Time: **O(n)**
- Space: **O(n)**

---

## Approach 3 — Space-Optimized DP (Optimal) ✅

Since we only need the last two values, we can use two variables instead of an array.

```typescript
function climbStairs(n: number): number {
  if (n <= 2) return n;
  let prev2 = 1;
  let prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}
```

**Complexity:**
- Time: **O(n)** — Single pass from 3 to n.
- Space: **O(1)** — Only two variables.

---

## Key Insight

This problem is essentially the Fibonacci sequence in disguise. The number of ways to reach step `n` is `fib(n+1)`. Recognizing this pattern is the key to solving it efficiently. The recurrence `f(n) = f(n-1) + f(n-2)` arises because from step `n`, you could have arrived from step `n-1` (took 1 step) or step `n-2` (took 2 steps).
