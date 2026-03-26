# Editorial — Reverse Integer

### Approach: Digits extraction and range check
We can reverse the integer by repeatedly popping the last digit off the end and pushing it to the front of the new integer.

To pop the last digit: `pop = x % 10; x = x / 10;`
To push the last digit: `temp = rev * 10 + pop; rev = temp;`

**Handling Overflow**
Crucially, we must check for overflow before `rev = rev * 10 + pop`.
The 32-bit signed integer range is $[-2,147,483,648, 2,147,483,647]$.
If `rev > MAX_INT / 10`, then `rev * 10` will overflow.
If `rev == MAX_INT / 10`, then `rev * 10 + pop` will overflow if `pop > 7`.

Similar logic applies for the negative boundary.

**Complexity**
- Time: $O(\log n)$, as there are roughly $\log_{10} n$ digits in $n$.
- Space: $O(1)$ extra space.
