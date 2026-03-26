# Editorial — Happy Number

### Approach 1: Detect Cycles with a Hash Set
As we compute the sum of squares of digits, we will either eventually reach 1 or get stuck in a cycle. A simple way to detect a cycle is to store all previous results in a `Set`. If we find a number already in the set, we know it's not a happy number.

**Complexity**
- Time: $O(\log n)$ for each step, and we don't visit many numbers before looping (the sum of squares of digits of a large number like $10^{13}$ drops very quickly).
- Space: $O(\log n)$ to store the seen numbers.

### Approach 2: Floyd's Cycle-Finding Algorithm
Similar to finding a cycle in a linked list, we can use two pointers: `slow` and `fast`. `slow` moves one step at a time, and `fast` moves two steps at a time. If they meet at a value other than 1, there is a cycle.

**Complexity**
- Time: $O(\log n)$
- Space: $O(1)$
