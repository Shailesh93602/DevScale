# Editorial — Count Primes

### Approach: Sieve of Eratosthenes
The Sieve of Eratosthenes is an ancient algorithm for finding all prime numbers up to any given limit. It does so by iteratively marking as composite (i.e., not prime) the multiples of each prime, starting from the first prime number, 2.

1. Create a boolean array `isPrime` of size `n` and initialize all entries to `true`.
2. Iterate `i` from 2 to $\sqrt{n}$:
   - If `isPrime[i]` is `true`, then it is a prime. Mark all its multiples starting from $i^2$ as `false`.
3. Count the number of `true` values in the array starting from index 2.

**Why start marking from $i^2$?**
Because all smaller multiples ($2i, 3i, \dots$) would have already been marked by smaller prime factors.

**Complexity**
- Time: $O(n \log \log n)$. This is incredibly fast for large $n$.
- Space: $O(n)$ to store the sieve.

**Optimization in JavaScript**
Using `Uint8Array` instead of a regular array of booleans can significantly reduce memory usage and improve performance due to better cache locality.
