# Editorial — Two Sum II - Input Array Is Sorted

### Approach: Two Pointers
Since the array is sorted, we can maintain two pointers $i$ and $j$, initially pointing to the first and last elements respectively. 

- If `numbers[i] + numbers[j] == target`, we found the answer.
- If `numbers[i] + numbers[j] < target`, we need a larger sum, so we increment $i$.
- If `numbers[i] + numbers[j] > target`, we need a smaller sum, so we decrement $j$.

**Why does this work?**
Suppose `numbers[i] + numbers[j] > target`. Because the array is sorted, we know that for any $k > i$, `numbers[k] + numbers[j]` will also be $> target$. Thus, we don't need to check $j$ with any other elements between $i$ and $(j-1)$. We can safely discard the current $j$.

**Complexity**
- Time: $O(n)$ where $n$ is the number of elements in the array.
- Space: $O(1)$ extra space.
