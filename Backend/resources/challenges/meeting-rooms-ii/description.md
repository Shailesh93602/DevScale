# Meeting Rooms II

Given an array of meeting time intervals `intervals` where `intervals[i] = [start_i, end_i]`, return the **minimum number of conference rooms** required.

---

## Examples

**Example 1:**
```
Input: intervals = [[0,30],[5,10],[15,20]]
Output: 2
Explanation: Meeting [0,30] overlaps with [5,10] and [15,20], but [5,10] and [15,20] don't overlap with each other. We need 2 rooms.
```

**Example 2:**
```
Input: intervals = [[7,10],[2,4]]
Output: 1
Explanation: The meetings don't overlap, so 1 room is sufficient.
```

**Example 3:**
```
Input: intervals = [[0,5],[5,10],[10,15]]
Output: 1
Explanation: Each meeting ends before the next starts (a meeting ending at 5 doesn't conflict with one starting at 5).
```

---

## Constraints

- `1 <= intervals.length <= 10^4`
- `0 <= start_i < end_i <= 10^6`
