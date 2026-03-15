# Print FooBar Alternately

## Problem Description

Implement a class `FooBar` with two methods `foo` and `bar` that are called from separate async contexts. They should alternate execution so that the output is "foobar" repeated `n` times.

`foo()` prints "foo" and `bar()` prints "bar". They run concurrently but must alternate: foo, bar, foo, bar, ...

## Function Signature

```typescript
class FooBar {
  constructor(n: number);
  foo(printFoo: () => void): Promise<void>;
  bar(printBar: () => void): Promise<void>;
}
```

## Example

```
Input: n = 2
Output: "foobarfoobar"

Input: n = 1
Output: "foobar"
```

## Constraints

- 1 <= n <= 1,000
- `foo` and `bar` are called concurrently
- Output must strictly alternate: foo then bar
