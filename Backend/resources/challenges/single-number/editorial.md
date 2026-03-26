# Editorial — Single Number

### Approach 1: Bit Manipulation (XOR)
The XOR operation is the most efficient way to solve this problem while meeting the $O(n)$ time and $O(1)$ space constraints.

Key properties of XOR:
1. $a \oplus 0 = a$
2. $a \oplus a = 0$
3. $a \oplus b \oplus a = (a \oplus a) \oplus b = 0 \oplus b = b$

If we XOR every number in the array together, the pairs will cancel each other out, leaving only the single number.

**Complexity**
- Time: $O(n)$ because we iterate through the array once.
- Space: $O(1)$ because we only use one variable to store the result.

### Approach 2: Hash Table (Baseline)
We could use a hash table to count occurrences. This would take $O(n)$ time but $O(n)$ space, which is not optimal according to the problem constraints.
