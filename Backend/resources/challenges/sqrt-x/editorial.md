# Editorial — Sqrt(x)

### Approach 1: Binary Search
Since the square root is monotonic (as $n$ increases, $n^2$ also increases), we can use binary search to find the correct value. The range for the search is $[2, x/2]$ for $x \geq 2$.

For each `mid`, calculate `square = mid * mid`.
- If `square == x`, we found the exact root.
- If `square < x`, then `mid` could be the answer, so we store it and search the right half.
- If `square > x`, we search the left half.

**Complexity**
- Time: $O(\log x)$
- Space: $O(1)$

### Approach 2: Newton's Method
Newton's method is an iterative process to find roots of a function. To find $\sqrt{x}$, we solve for $f(k) = k^2 - x = 0$.
The update rule is: $k_{next} = \frac{1}{2}(k + \frac{x}{k})$.

**Complexity**
- Time: $O(\log x)$ (converges quadratically, faster in practice than binary search).
- Space: $O(1)$
