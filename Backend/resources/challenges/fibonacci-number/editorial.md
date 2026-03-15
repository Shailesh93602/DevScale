# Editorial — Fibonacci Number

## Problem Summary

Compute the nth Fibonacci number. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).

---

## Approach 1 — Recursion (Brute Force)

```typescript
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
```

**Complexity:** Time: O(2^n), Space: O(n)

---

## Approach 2 — Iterative (Optimal) ✅

```typescript
function fib(n: number): number {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

**Complexity:** Time: O(n), Space: O(1)

---

## Key Insight

The classic introduction to dynamic programming. Each value depends only on the previous two, so we only need two variables.
