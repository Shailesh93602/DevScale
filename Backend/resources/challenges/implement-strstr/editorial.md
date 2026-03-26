# Editorial — Implement strStr()

### Approach 1: Brute Force (Naive)
We iterate through the `haystack` and for each character, we check if the substring starting at that index matches the `needle`.

**Complexity**
- Time: $O(N \times M)$ where $N$ is the length of `haystack` and $M$ is the length of `needle`. In the worst case (e.g., `haystack = "aaaaa", needle = "aab"`), we check almost every character.
- Space: $O(1)$.

### Approach 2: KMP Algorithm (Optimal)
The Knuth-Morris-Pratt algorithm improves the time complexity to $O(N + M)$ by avoiding redundant comparisons. It uses a prefix function (often called the `pi` array or `LPS` - Longest Proper Prefix which is also a Suffix) to skip characters in the `haystack`.

**Complexity**
- Time: $O(N + M)$.
- Space: $O(M)$ for the prefix array.
