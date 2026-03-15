# Minimum Number of Refueling Stops

A car travels from a starting position to a `target` destination, which is `target` miles east of the starting position.

Along the way, there are gas stations. Each `station[i]` represents a gas station that is `position_i` miles east of the starting position, and has `fuel_i` liters of gas.

The car starts with an infinite tank of gas, which initially has `startFuel` liters of fuel in it. It uses 1 liter of gas per 1 mile that it drives. When the car reaches a gas station, it may stop and refuel, transferring all the gas from the station into the car.

Return *the minimum number of refueling stops the car must make in order to reach its destination.* If it cannot reach the destination, return `-1`.

Note that if the car reaches a gas station with `0` fuel left, the car can still refuel there. If the car reaches the destination with `0` fuel left, it is still considered to have arrived.

---

## Examples

**Example 1:**
```text
Input: target = 1, startFuel = 1, stations = []
Output: 0
Explanation: We can reach the target without refueling.
```

**Example 2:**
```text
Input: target = 100, startFuel = 1, stations = [[10, 100]]
Output: -1
Explanation: We can't reach the first station even though there is 100 liters of gas there.
```

**Example 3:**
```text
Input: target = 100, startFuel = 10, stations = [[10, 60], [20, 30], [30, 30], [60, 40]]
Output: 2
Explanation: 
We start with 10 liters of fuel.
We drive to position 10, expending 10 liters of fuel. We refuel from 0 liters to 60 liters of gas.
Then, we drive from position 10 to position 60 (expending 50 liters of fuel),
and refuel from 10 liters to 50 liters of gas. We then drive to and reach the target.
We made 2 refueling stops along the way, so we return 2.
```

---

## Constraints

- `1 <= target, startFuel <= 10^9`
- `0 <= stations.length <= 500`
- `1 <= position_i < position_{i+1} < target`
- `1 <= fuel_i < 10^9`
