# Editorial — N-th Tribonacci Number

## Problem Summary

Compute T(n) where T(n) = T(n-1) + T(n-2) + T(n-3), with T(0)=0, T(1)=1, T(2)=1.

---

## Optimal Approach ✅

Use three variables, similar to Fibonacci but tracking three previous values.

```typescript
function tribonacci(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  let a = 0, b = 1, c = 1;
  for (let i = 3; i <= n; i++) {
    const next = a + b + c;
    a = b;
    b = c;
    c = next;
  }
  return c;
}
```

**Complexity:** Time: O(n), Space: O(1)

---

## Key Insight

Extension of the Fibonacci pattern to three terms. Track three previous values and rotate.
