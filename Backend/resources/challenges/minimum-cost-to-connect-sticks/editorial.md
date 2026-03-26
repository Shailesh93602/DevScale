# Editorial — Minimum Cost to Connect Sticks

### Approach: Greedy with Min-Heap
To minimize the total cost, we want to ensure that the larger stick lengths are added as few times as possible. This means we should always pick the two smallest available sticks to combine.

**Why?**
When we combine two sticks of length $x$ and $y$, the cost is $x + y$. This new stick of length $x+y$ will then be part of a future combination. By picking the smallest $x$ and $y$, we minimize the intermediate cost and keep the sum small for the next steps.

**Algorithm**
1. Insert all stick lengths into a **Min-Heap**.
2. While the heap has more than one stick:
   - Pop the two smallest sticks, $s_1$ and $s_2$.
   - Calculate their sum $cost = s_1 + s_2$.
   - Add $cost$ to the `totalCost`.
   - Push the new stick of length $cost$ back into the heap.
3. Return `totalCost`.

**Complexity**
- Time: $O(N \log N)$ where $N$ is the number of sticks. Each insertion and deletion in the heap takes $O(\log N)$.
- Space: $O(N)$ to store the sticks in the heap.
