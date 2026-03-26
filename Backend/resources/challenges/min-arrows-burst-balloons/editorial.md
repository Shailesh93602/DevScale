# Editorial — Minimum Arrows to Burst Balloons

### The Greedy Strategy
This problem is a variation of the **Interval Scheduling** or **Activity Selection** problem. To minimize the number of arrows, we want each arrow to burst as many overlapping balloons as possible.

The most effective greedy choice is to **sort the balloons by their end coordinate**. 

### Why sort by end coordinate?
Suppose you sort by the end position. To burst the balloon that ends the earliest, you **must** shoot an arrow at or before its end position. To make this arrow as "useful" as possible for future balloons, you should shoot it at the **last possible moment**, which is exactly at its `end` position. 

Any subsequent balloon that **starts** before or at this arrow location will also be burst.

### Algorithm
1.  Sort the `points` array based on the end position (`a[1]`).
2.  Initialize `arrows = 1`.
3.  Set the position of the first arrow (`firstEnd`) to the end of the first balloon.
4.  Iterate through the remaining balloons:
    - If a balloon's start position is greater than `firstEnd`, it means the current arrow cannot reach it.
    - We need a new arrow. Increment `arrows` and update `firstEnd` to the end position of this new balloon.
5. Return the total count.

### Complexity Analysis
- **Time Complexity**: $O(N \log N)$ where $N$ is the number of balloons, due to sorting.
- **Space Complexity**: $O(\log N)$ or $O(1)$ depending on the sorting implementation.

