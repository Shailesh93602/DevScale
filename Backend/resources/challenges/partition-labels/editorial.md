# Editorial — Partition Labels

### The Problem
We want to split a string into maximum number of parts such that no character appears in more than one part. This implies that if a character `c` is in a partition, then **all** occurrences of `c` must be within that same partition.

### The Greedy Strategy
For each character, the "boundary" of the partition it belongs to must be at least its **last occurrence** in the string.

### Algorithm
1.  **Pre-process**: Iterate through the string and store the `last_index` of each character in a map/hash table.
2.  **Iterate and Partition**: 
    - Keep two pointers: `start` (beginning of current partition) and `end` (current boundary of partition).
    - Iterate through the string with index `i`.
    - At each step, update `end = max(end, last_index[s[i]])`. This ensures the current partition includes the furthest occurrence of any character encountered so far.
    - If `i == end`, it means we've reached a point where all characters encountered so far have no more occurrences later in the string. 
    - This is a valid cut point! Add the size `i - start + 1` to the results and update `start = i + 1`.

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the length of the string. We make two passes.
- **Space Complexity**: $O(1)$ because the hash table stores at most 26 lowercase English letters.

