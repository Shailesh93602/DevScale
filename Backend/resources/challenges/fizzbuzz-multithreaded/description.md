# FizzBuzz Multithreaded

## Problem Description

Implement a multithreaded FizzBuzz using four concurrent functions:

- `fizz()` - called for numbers divisible by 3 (but not 15)
- `buzz()` - called for numbers divisible by 5 (but not 15)
- `fizzbuzz()` - called for numbers divisible by 15
- `number()` - called for all other numbers

All four functions run concurrently and must coordinate to produce the correct FizzBuzz sequence from 1 to n.

## Function Signature

```typescript
class FizzBuzzMT {
  constructor(n: number);
  fizz(printFizz: () => void): Promise<void>;
  buzz(printBuzz: () => void): Promise<void>;
  fizzbuzz(printFizzBuzz: () => void): Promise<void>;
  number(printNumber: (n: number) => void): Promise<void>;
}
```

## Example

```
Input: n = 15
Output: ["1","2","fizz","4","buzz","fizz","7","8","fizz","buzz","11","fizz","13","14","fizzbuzz"]
```

## Constraints

- 1 <= n <= 10,000
