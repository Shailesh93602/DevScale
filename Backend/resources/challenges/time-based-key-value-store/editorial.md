# Editorial — Time Based Key-Value Store

### Approach: Hash Map with Binary Search
We need to store values associated with a key at different points in time. A `Map<String, List>` where the string is the key and the list contains objects like `{timestamp, value}` is ideal.

**Why Binary Search?**
The constraints mention that timestamps in `set` calls are **strictly increasing**. This means for any key, the list of values we store is automatically sorted by timestamp. When we need to find a value for `timestamp_prev <= target_timestamp`, we are looking for the "floor" of the target timestamp in a sorted list. Binary Search handles this in $O(\log N)$.

**Algorithm**
1. **set(key, value, timestamp)**:
   - If the key doesn't exist in our map, create a new entry with an empty list.
   - Append the `{timestamp, value}` pair to the list.
2. **get(key, timestamp)**:
   - If the key doesn't exist, return "".
   - Perform binary search on the list of pairs to find the largest index `mid` such that `list[mid].timestamp <= target_timestamp`.
   - Return `list[mid].value` if found, otherwise return "".

**Complexity**
- Time:
  - `set`: $O(1)$ (amortized for list appending).
  - `get`: $O(\log N)$ where $N$ is the number of times `set` was called for that key.
- Space: $O(M)$ where $M$ is the number of `set` operations in total.

