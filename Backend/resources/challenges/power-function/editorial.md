# Editorial — Pow(x, n)

### Approach 1: Fast Exponentiation (Recursive)
Binary exponentiation, also known as exponentiation by squaring, is a technique to compute $x^n$ in $O(\log n)$ time.

The recurrence relation is:
$Pow(x, n) = \begin{cases} (Pow(x, n/2))^2 & \text{if } n \text{ is even} \\ x \times (Pow(x, n/2))^2 & \text{if } n \text{ is odd} \end{cases}$

**Handling Negative Exponents**
If $n < 0$, then $x^n = (\frac{1}{x})^{-n}$.

**Complexity**
- Time: $O(\log n)$
- Space: $O(\log n)$ for recursive stack space.

### Approach 2: Fast Exponentiation (Iterative)
We can also implement this iteratively to achieve $O(1)$ space.
```typescript
function myPow(x: number, n: number): number {
    let N = n;
    if (N < 0) {
        x = 1 / x;
        N = -N;
    }
    let ans = 1;
    let currentProduct = x;
    for (let i = N; i > 0; i = Math.floor(i / 2)) {
        if (i % 2 === 1) {
            ans = ans * currentProduct;
        }
        currentProduct = currentProduct * currentProduct;
    }
    return ans;
}
```

**Complexity**
- Time: $O(\log n)$
- Space: $O(1)$
