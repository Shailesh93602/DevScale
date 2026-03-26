# Editorial — Find First and Last Position in Sorted Array

### The Power of Binary Search
Since the array is sorted and we need $O(\log N)$ complexity, **Binary Search** is the only candidate. 

### Why not just one search?
A standard binary search finds **any** occurrence of the target. However, if the target appears multiple times, we need the very first and the very last one.

### The Modified Binary Search
We can write a helper function `findBound(isFirst)` that finds either the first or the last occurrence:
1.  **Finding the First**: When `nums[mid] == target`, instead of returning `mid`, we store `mid` as a potential answer and continue searching the **left** half (`right = mid - 1`) to see if there's an even earlier occurrence.
2.  **Finding the Last**: When `nums[mid] == target`, we store `mid` and continue searching the **right** half (`left = mid + 1`).

### Complexity Analysis
- **Time Complexity**: $O(\log N)$. We perform two binary searches.
- **Space Complexity**: $O(1)$.

