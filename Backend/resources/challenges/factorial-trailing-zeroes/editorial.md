# Editorial — Factorial Trailing Zeroes

### Approach: Counting Factors of 5
Trailing zeros are created by factors of 10. Since $10 = 2 \times 5$, we need to find pairs of $(2, 5)$ in the prime factorization of $n!$.
In any factorial, multiples of 2 occur much more frequently than multiples of 5. Therefore, the number of trailing zeros is determined entirely by the number of times 5 appears as a factor in $n!$.

How many factors of 5 are there in $n!$?
- Every 5th number contributes at least one factor of 5: $\lfloor n/5 \rfloor$.
- Every 25th number contributes an *additional* factor of 5: $\lfloor n/25 \rfloor$.
- Every 125th number contributes yet another: $\lfloor n/125 \rfloor$.

The total count is:
$Count = \sum_{i=1}^{\infty} \lfloor \frac{n}{5^i} \rfloor$

**Complexity**
- Time: $O(\log_5 n)$, which is very efficient.
- Space: $O(1)$ extra space.
