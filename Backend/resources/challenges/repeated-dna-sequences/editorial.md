# Editorial — Repeated DNA Sequences

### Approach 1: Hash Set
The most straightforward approach is to use a sliding window of size 10 and store each substring in a `Set`. If we encounter a sequence already in the set, we add it to our results.

To avoid adding the same sequence multiple times to the result array, we use another `Set` for the duplicates.

**Complexity**
- Time: $O(N \times L)$ where $N$ is the length of the string and $L=10$ is the length of the substring.
- Space: $O(N \times L)$ to store the substrings in the set.

### Approach 2: Bit Manipulation & Rolling Hash
Since there are only 4 nucleotides, each can be represented by 2 bits:
- A: 00
- C: 01
- G: 10
- T: 11

A 10-letter sequence can thus be represented by a 20-bit integer. This significantly reduces the space complexity and allows for faster comparisons (comparing integers vs strings).

**Complexity**
- Time: $O(N)$
- Space: $O(N)$ for the set, but with smaller per-element footprint.
