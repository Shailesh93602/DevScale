# Editorial — Permutation in String

### Approach: Sliding Window with Frequency Map
The core idea is that any permutation of string `s1` will have the same character frequencies. Therefore, we need to find if there exists a substring of `s2` with length equal to `s1.length` that has the same character frequency map as `s1`.

1. Create a frequency map (or array of size 26) for `s1`.
2. Maintain a sliding window of size `n = s1.length` over `s2`.
3. Keep track of the frequency of characters within this window in `s2`.
4. At each step, update the frequency map of the window by:
   - Adding the new character on the right.
   - Removing the character that is no longer in the window on the left.
5. If the window's frequency map matches `s1`'s frequency map at any point, return `true`.

**Optimization**
Instead of comparing the entire frequency array at each step ($O(26)$), we can maintain a `matches` variable that tracks how many characters (out of 26) have the same frequency in both `s1` and the current window of `s2`.

**Complexity**
- Time: $O(N)$ where $N$ is the length of `s2`.
- Space: $O(1)$ since the frequency array size is constant (26).
