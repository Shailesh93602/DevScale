# The Dining Philosophers

## Problem Description

Five philosophers sit at a round table with a fork between each pair. To eat, a philosopher needs both the left and right fork. Design a solution that prevents deadlock and allows all philosophers to eat.

Implement a deadlock-free solution using resource ordering: each philosopher always picks up the lower-numbered fork first.

## Function Signature

```typescript
function diningPhilosophers(
  n: number,
  rounds: number
): { actions: string[][]; deadlockFree: boolean }
```

## Parameters

- `n`: Number of philosophers (seated in a circle)
- `rounds`: Number of eating rounds per philosopher

## Example

```
Input: n = 5, rounds = 1
Output:
  actions = [
    ["P0: pick fork 0", "P0: pick fork 1", "P0: eat", "P0: put fork 1", "P0: put fork 0"],
    ...
  ]
  deadlockFree = true
```

## Constraints

- 1 <= n <= 10
- 1 <= rounds <= 100
- Must be deadlock-free
- Use resource ordering (pick lower-numbered fork first)
