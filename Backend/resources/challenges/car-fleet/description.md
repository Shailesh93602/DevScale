# Car Fleet

There are `n` cars going to the same destination along a one-lane road. The destination is `target` miles away.

You are given two integer arrays `position` and `speed`, both of length `n`, where `position[i]` is the position of the `i`th car and `speed[i]` is the speed of the `i`th car (in miles per hour).

A car can never pass another car ahead of it, but it can catch up to it and drive bumper to bumper **at the same speed**. The faster car will **slow down** to match the slower car's speed. The distance between these two cars is ignored (they are assumed to be at the same position).

A **car fleet** is some non-empty set of cars driving at the same position and same speed. Note that a single car is also a car fleet.

If a car catches up to a car fleet right at the destination point, it still counts as one fleet.

Return the **number of car fleets** that will arrive at the destination.

---

## Examples

**Example 1:**
```
Input: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]
Output: 3
Explanation:
- Car at position 10 with speed 2: arrives at time (12-10)/2 = 1
- Car at position 8 with speed 4: arrives at time (12-8)/4 = 1. Catches car at 10, forms fleet.
- Car at position 5 with speed 1: arrives at time (12-5)/1 = 7. Alone.
- Car at position 3 with speed 3: arrives at time (12-3)/3 = 3. Catches car at 5? No, 3 < 7, arrives before. Alone.
- Car at position 0 with speed 1: arrives at time (12-0)/1 = 12. Alone.
3 fleets: {10,8}, {5}, {3}, but car 0 catches fleet with car 5? Actually need to process closest to target first.
```

**Example 2:**
```
Input: target = 10, position = [3], speed = [3]
Output: 1
```

**Example 3:**
```
Input: target = 100, position = [0,2,4], speed = [4,2,1]
Output: 1
Explanation: All cars eventually merge into one fleet.
```

---

## Constraints

- `n == position.length == speed.length`
- `1 <= n <= 10^5`
- `0 < target <= 10^6`
- `0 <= position[i] < target`
- `0 < speed[i] <= 10^6`
