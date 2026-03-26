# Editorial — Queue Reconstruction by Height

### The Greedy Strategy
This problem asks us to reconstruct a queue based on height and the number of people taller or equal in front. At first glance, it's not obvious how to start. 

The key insight is to **process people from tallest to shortest**. 

### Why Tallest First?
1. If we process people with greater heights first, their relative placement in the queue is easy. If a person of height `H` has `K` taller people in front, we can just place them at index `K` of the current queue.
2. When we then process a shorter person, we can insert them at their specific `K` position. 
3. **CRITICAL POINT**: Because any person already in the queue is **taller or equal** to the current person, and any person we add later will be **shorter**, inserting the current person at index `K` doesn't break the rules for the people already there. Shorter people inserted behind or in front of a taller person don't affect that person's `K` count.

### Algorithm
1.  **Sort**: Sort the `people` array:
    -   Primary sort: **Height descending**.
    -   Secondary sort (for same height): **K-value ascending**. (This ensures that for people with the same height, the one who needs fewer people in front comes first).
2.  **Greedy Fill**: Iterate through the sorted `people`.
    -   For each person `[h, k]`, insert them into the result list at index `k`.
3.  Return the result list.

### Example Walkthrough
`people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]`
1. Sort: `[[7,0], [7,1], [6,1], [5,0], [5,2], [4,4]]`
2. Insert [7,0]: `[[7,0]]`
3. Insert [7,1]: `[[7,0], [7,1]]`
4. Insert [6,1]: `[[7,0], [6,1], [7,1]]` (6 inserted at index 1)
5. Insert [5,0]: `[[5,0], [7,0], [6,1], [7,1]]` (5 inserted at index 0)
6. Insert [5,2]: `[[5,0], [7,0], [5,2], [6,1], [7,1]]` (5 inserted at index 2)
7. Insert [4,4]: `[[5,0], [7,0], [5,2], [6,1], [4,4], [7,1]]` (4 inserted at index 4)

### Complexity Analysis
- **Time Complexity**: $O(N^2)$. Sorting takes $O(N \log N)$, but inserting into an array take $O(N)$ in the worst case (with `splice`). Since we do it $N$ times, total is $O(N^2)$. For $N=2000$, this is acceptable.
- **Space Complexity**: $O(N)$ to store the output.
