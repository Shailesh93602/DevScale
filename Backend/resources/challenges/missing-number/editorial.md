# Editorial — Missing Number

### Approach 1: Gauss Formula (Math)
The sum of the first $n$ natural numbers is given by the formula $\frac{n(n+1)}{2}$. We can compute this expected sum and then subtract the sum of all elements in the given array. The result will be the missing number.

**Complexity**
- Time: $O(n)$ to sum the array.
- Space: $O(1)$ extra space.

### Approach 2: Bit Manipulation (XOR)
We know that $a \oplus a = 0$ and $a \oplus 0 = a$. If we XOR all numbers from $0$ to $n$ and then XOR that result with all numbers in the array, every number present in the array will appear twice (canceling out to $0$), except for the missing number which appears only once.

```typescript
function missingNumber(nums: number[]): number {
    let missing = nums.length;
    for (let i = 0; i < nums.length; i++) {
        missing ^= i ^ nums[i];
    }
    return missing;
}
```

**Complexity**
- Time: $O(n)$
- Space: $O(1)$
