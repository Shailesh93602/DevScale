# Editorial — Combination Sum

## Approach: Backtracking (O(N^(T/M)) Time, O(T/M) Space)

The problem asks for combinations of numbers that sum up uniquely to a `target` using an array `candidates`. The tricky part is that we can reuse the same number an UNLIMITED number of times.

Because order doesn't matter (e.g. `[2, 2, 3]` is identical to `[3, 2, 2]`), we need to be careful to avoid producing duplicate combinations. We can do this by forcing our combinations to be built in order: at any given step evaluating `candidates[i]`, we can **either use `candidates[i]` repeatedly**, OR we can move on to `candidates[i+1]` and **never look back at `candidates[i]` again**.

We will use a standard recursive **Backtracking** approach with two parameters:
- `index`: The current candidate number we are considering.
- `currentSum`: The current running sum of our chosen combination.

**Base Cases:**
1. If `currentSum === target`: We have achieved exactly the target! Push a copy of our combination into the result array and return to stop exploring this path.
2. If `currentSum > target` OR `index === candidates.length`: Our combination has either exceeded the allowable sum or we've run out of numbers to consider. Return early (this is a classic backtracking optimization called "pruning").

**Recursive Steps:**
If our base cases aren't met, we make our two choices:
- **Choice 1 (Use Number Again):** Suppose we are at `index`. We *push* `candidates[index]` into our `current` array. We recursively call `backtrack(index, currentSum + candidates[index])`. Notice how we pass `index` (not `index + 1`); this allows us to pick the same number again indefinitely! Upon returning, we backtrack by *popping* the choice out of `current`.
- **Choice 2 (Skip Number):** We recursively call `backtrack(index + 1, currentSum)`. This branch decides we are totally finished with the number at `index` and moves forward to the next one, guaranteeing no duplicate combinations are accidentally minted.

```typescript
function combinationSum(candidates: number[], target: number): number[][] {
  const result: number[][] = [];
  const current: number[] = [];

  function backtrack(index: number, currentSum: number) {
    if (currentSum === target) {
      result.push([...current]);
      return;
    }
    // Prune invalid branches
    if (index >= candidates.length || currentSum > target) {
      return;
    }

    // Branch 1: Include current again
    current.push(candidates[index]);
    backtrack(index, currentSum + candidates[index]);
    
    // Backtrack choice
    current.pop();

    // Branch 2: Exclude current and move to next
    backtrack(index + 1, currentSum);
  }

  backtrack(0, 0); // Start at index 0 with a sum of 0
  return result;
}
```

**Complexity:**
- **Time:** **O(N^(target/M))** loosely bounded depending on the size of the candidates, where `N` is the number of candidates, `target` is the target value, and `M` is the minimum value among the candidates. The recursion tree can become quite wide and deep as we can repeat values.
- **Space:** **O(target/M)** which is the maximum number of recursive calls (or the depth of the recursion tree). This corresponds to using the smallest element repeatedly.
