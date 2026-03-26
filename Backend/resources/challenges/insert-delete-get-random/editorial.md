# Editorial — Insert Delete GetRandom O(1)

### The Challenge of O(1) Random
To achieve $O(1)$ `insert` and `remove`, we immediately think of a **Hash Map** or **Hash Set**. However, these don't support picking a random element in $O(1)$ because their internal structure (buckets) doesn't allow uniform index-based access.

To achieve $O(1)$ `getRandom`, we need an **Array** (or List). But removing an arbitrary element from an array is $O(N)$ because all subsequent elements must be shifted.

### The Swap Trick
The solution is to use both a **Hash Map** and an **Array** together:
1.  **Map**: Stores `value -> index in the array`.
2.  **Array**: Stores the actual `values`.

**How to remove in O(1)**:
- Find the index of the value to be removed using the map.
- Get the very last element of the array.
- "Swap" the value at the target index with the last element. Effectively, overwrite the target index with the last element's value.
- Update the map for the last element to point to its new index.
- Pop the last element from the array. This is $O(1)$ because no shifting is required.

### Example Walkthrough
Set: `[10, 20, 30, 40]`. Map: `{10:0, 20:1, 30:2, 40:3}`.
Target: Remove `20`.
1. Index of `20` is `1`. Last value is `40`.
2. Move `40` to index `1`: Array becomes `[10, 40, 30, 40]`.
3. Update Map: `{10:0, 40:1, 30:2}`.
4. Pop last: Array becomes `[10, 40, 30]`.

### Complexity Analysis
- **Time Complexity**: Average $O(1)$ for all operations. Hash map operations and array end-manipulations are constant time on average.
- **Space Complexity**: $O(N)$ where $N$ is the number of elements in the set.

