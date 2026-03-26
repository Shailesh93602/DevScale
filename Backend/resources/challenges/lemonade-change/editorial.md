# Editorial — Lemonade Change

### Simulation and Greedy
We can solve this problem by simulating the process of selling lemonade. We only need to keep track of the number of `$5` and `$10` bills we have. We don't need to track `$20` bills because they can never be used as change.

### Handling Bills
1.  **$5 Bill**: No change needed. Simply increment the `$5` count.
2.  **$10 Bill**: Must give back one `$5`. If we have no `$5` bills, return `false`. Otherwise, decrement `$5` and increment `$10`.
3.  **$20 Bill**: Must give back `$15`. There are two ways to do this:
    -   **Option A**: One `$10` and one `$5`.
    -   **Option B**: Three `$5` bills.

### The Greedy Choice
When faced with a `$20` bill, we should **always prefer Option A** (using a `$10` bill). 
**Why?** Because a `$5` bill is more versatile than a `$10` bill. A `$5` can be used to give change for both `$10` and `$20`, whereas a `$10` can only be used to give change for `$20`. Keeping `$5` bills as long as possible increases our chances of being able to give change in the future.

### Complexity Analysis
- **Time Complexity**: $O(N)$ where $N$ is the number of bills. We iterate through the array once.
- **Space Complexity**: $O(1)$ as we only store two counters.

