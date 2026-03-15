# Print Zero Even Odd

## Problem Description

Implement a class `ZeroEvenOdd` with three methods that run concurrently. The output should follow the pattern: 0, 1, 0, 2, 0, 3, 0, 4, ... up to n.

- `zero()` prints "0"
- `odd()` prints odd numbers (1, 3, 5, ...)
- `even()` prints even numbers (2, 4, 6, ...)

The three functions run concurrently and must coordinate to produce the correct interleaved output.

## Function Signature

```typescript
class ZeroEvenOdd {
  constructor(n: number);
  zero(printZero: () => void): Promise<void>;
  even(printEven: (n: number) => void): Promise<void>;
  odd(printOdd: (n: number) => void): Promise<void>;
}
```

## Example

```
Input: n = 5
Output: "0102030405"

Input: n = 2
Output: "0102"
```

## Constraints

- 1 <= n <= 1,000
- Output pattern: 01020304...0n
