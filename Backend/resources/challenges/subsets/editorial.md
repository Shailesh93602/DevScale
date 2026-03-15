# Editorial — Subsets

## Approach: Backtracking (O(N * 2^N) Time, O(N) Space)

The essence of generating the power set (all subsets) is that for every single element in `nums`, we have a binary choice:
1. **Include** the element in our current subset.
2. **Exclude** the element from our current subset.

Since there are `N` elements and 2 choices for each, there will be exactly `2^N` subsets.

We can use **Backtracking** (a systematic way to iterate through all the possible configurations of a search space) to build these subsets.

1. Create a `result` array to store our final answers, and a `current` array to keep track of the path we are currently exploring.
2. We define a recursive helper function `backtrack(index)` which takes our current position `index` in the `nums` array.
3. **Base Case:** If `index === nums.length`, we have made a choice for every element. We push a **copy** `[...current]` of our path into `result` and return.
4. **Recursive Step (Include):** Add `nums[index]` to `current`. Recurse to the next element: `backtrack(index + 1)`.
5. **Backtrack:** When the recursive call returns, we need to undo our choice to explore the other branch. Pop the element from `current`.
6. **Recursive Step (Exclude):** Recurse to the next element: `backtrack(index + 1)`.

By the time the initial `backtrack(0)` call finishes, we will have exhaustively explored all `2^N` possible includes/excludes.

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(index: number) {
    if (index === nums.length) {
      result.push([...current]);
      return;
    }

    // Branch 1: Include
    current.push(nums[index]);
    backtrack(index + 1);
    
    // Undo choice
    current.pop();

    // Branch 2: Exclude
    backtrack(index + 1);
  }

  backtrack(0);
  return result;
}
```

**Complexity:**
- **Time:** **O(N * 2^N)** because there are `2^N` possible subsets and for each subset, we spend `O(N)` time copying it into the results array.
- **Space:** **O(N)** for the recursion stack and the `current` array, not counting the `O(N * 2^N)` space required to store the output.
