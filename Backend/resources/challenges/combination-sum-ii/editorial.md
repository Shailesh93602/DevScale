# Editorial — Combination Sum II

## Problem Summary
Given an array `candidates` and a `target`, find all unique combinations of numbers that sum to the target. Unlike Combination Sum I, each number in `candidates` can be used only **once**, and the input might contain duplicate numbers.

## Approach: Backtracking with Pruning and Duplicate Handling
Since we need all unique combinations, backtracking is the natural choice.

### Key Implementation Details:
1. **Sort the array**: This is crucial for two reasons:
   - It allows us to stop early (pruning) if the current candidate exceeds the remaining target.
   - It allows us to identify and skip duplicates easily.
2. **Duplicate Handling**: In the loop `for (let i = start; i < candidates.length; i++)`, if `i > start` and `candidates[i] === candidates[i - 1]`, we skip this iteration. This ensures that for a specific position in our combination, we don't try the same number multiple times if it appears multiples times at the same "level" of selection.
3. **Select Once**: When recursing, we pass `i + 1` as the next starting index to ensure the same element isn't reused.

### Complexity Analysis:
- **Time Complexity**: $O(2^n \times n)$. In the worst case, every element is part of some combination. $n$ is for copying the path into the result.
- **Space Complexity**: $O(n)$ for the recursion depth.

## Visualization
For `candidates = [1, 1, 2], target = 3`:
- Level 0: 
  - Pick index 0 (val 1). Path: [1]. Recurse with start=1, rem=2.
    - Level 1:
      - Pick index 1 (val 1). Path: [1, 1]. Recurse with start=2, rem=1.
        - Level 2: Skip index 2 (val 2 > 1).
      - Pick index 2 (val 2). Path: [1, 2]. Found! [1, 2].
  - Index 1 (val 1) is skipped (duplicate of index 0 at same level).
  - Pick index 2 (val 2). Path: [2]. Recurse...
