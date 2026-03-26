# Editorial — Maximum Units on a Truck

### The Greedy Philosophy
To maximize the total units on a fixed-size truck, we should always prioritize boxes that contain the **most units per box**. This is similar to the Fractional Knapsack problem where we want the highest "value density".

### Algorithm
1.  **Sort**: Sort the `boxTypes` array based on `numberOfUnitsPerBox` in descending order.
2.  **Greedy Fill**: Iterate through the sorted list.
    -   While the truck has capacity and there are boxes of the current (highest unit) type:
        -   Take as many as you can (either all boxes of that type or until the truck is full).
        -   Update the total units and the remaining truck capacity.

### Complexity Analysis
- **Time Complexity**: $O(N \log N)$ where $N$ is the length of `boxTypes`, due to sorting.
- **Space Complexity**: $O(\log N)$ or $O(1)$ space used by the sorting algorithm.
