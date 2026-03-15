# Print in Order

## Problem Description

Design a mechanism to ensure that three functions (`first`, `second`, `third`) always execute in order, regardless of the order they are called in. Each function accepts a callback that prints its respective word.

The same instance of `OrderedPrinter` will be used, and the three functions will be called on separate async contexts (simulating threads). You need to ensure `first` completes before `second` starts, and `second` completes before `third` starts.

## Function Signature

```typescript
class OrderedPrinter {
  first(printFirst: () => void): Promise<void>;
  second(printSecond: () => void): Promise<void>;
  third(printThird: () => void): Promise<void>;
}
```

## Example

```
Input: order = [2, 1, 3]
Output: "firstsecondthird"

Explanation: Even though second() is called first,
it waits until first() completes before executing.
```

## Constraints

- `order` is always a permutation of [1, 2, 3]
- Each function is called exactly once
- The output must always be "firstsecondthird"
