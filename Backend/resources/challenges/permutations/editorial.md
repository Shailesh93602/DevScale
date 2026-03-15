# Editorial — Permutations

## Approach: Backtracking (O(N * N!) Time, O(N) Space)

Generating all the permutations of a given array where **all integers are unique** requires systematically selecting each available element for each position. Unlike subsets or combinations which are "choose" vs "not choose" for each element sequentially, permutations involve making a choice from a *pool* of available elements at every step.

If `N` is the length of `nums`, then:
- In the first slot, you have `N` choices.
- In the second slot, you have `N - 1` choices left.
- In the third slot, `N - 2` choices left, and so on. 

Total permutations will be exactly `N!` (N factorial).

We can build these permutations iteratively (backtracking). To achieve this, we can maintain:
1. An array `result` to hold all of our completed permutations.
2. A `current` array to keep the growing sequence we're building.
3. A `visited` boolean array (or a `Set`) of the same size as `nums` to keep track of *which specific indices we have already included in the `current` array*. Since the numbers are guaranteed to be unique, we could also just check `current.includes(num)`, but a `visited` boolean array is generally `O(1)` faster than `O(N)` `includes()` checks!

**Recursive Strategy:**
- Our base case is when `current.length === nums.length`. We've built a full permutation. We copy the permutation via `[...current]` into `result` and return.
- If we haven't hit the base case, we initiate a `for` loop starting from `i = 0` to `nums.length - 1`. If `visited[i]` is not true, we are free to select it.
- We set `visited[i] = true`, push `nums[i]` into `current`. Then we make a recursive call `backtrack()`.
- After `backtrack()` finishes, we must undo our choice to explore alternative permutations. We set `visited[i] = false`, and pop from `current`.

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];
  const visited = new Array(nums.length).fill(false);

  function backtrack() {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < nums.length; i++) {
      // Don't reuse already selected elements
      if (visited[i]) continue;
      
      visited[i] = true;
      current.push(nums[i]);
      
      // Explore path
      backtrack();
      
      // Undo choice
      current.pop();
      visited[i] = false;
    }
  }

  backtrack();
  return result;
}
```

**Complexity:**
- **Time:** **O(N * N!)** — Building the permutation takes `O(N!)` recursive steps, and constructing the final result copy arrays at the leaves takes an extra `O(N)` per leaf.
- **Space:** **O(N)** for the recursion tree depth and modifying the `visited` array (excluding the final result space).
