# Merge K Sorted Arrays

You are given an array of `k` arrays of integers, where each array is sorted in **ascending order**.

Merge all the arrays into one sorted array and return it.

---

## Examples

**Example 1:**
```text
Input: arrays = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The arrays are:
[
  [1,4,5],
  [1,3,4],
  [2,6]
]
merging them into one sorted list:
[1,1,2,3,4,4,5,6]
```

**Example 2:**
```text
Input: arrays = []
Output: []
```

**Example 3:**
```text
Input: arrays = [[]]
Output: []
```

---

## Constraints

- `k == arrays.length`
- `0 <= k <= 10^4`
- `0 <= arrays[i].length <= 500`
- `-10^4 <= arrays[i][j] <= 10^4`
- `arrays[i]` is sorted in ascending order.
- The sum of `arrays[i].length` will not exceed `10^4`.
