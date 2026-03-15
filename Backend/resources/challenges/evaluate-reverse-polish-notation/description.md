# Evaluate Reverse Polish Notation

You are given an array of strings `tokens` that represents an arithmetic expression in a [Reverse Polish Notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation).

Evaluate the expression. Return an integer that represents the value of the expression.

**Note:**
- The valid operators are `+`, `-`, `*`, and `/`.
- Each operand may be an integer or another expression.
- The division between two integers always **truncates toward zero**.
- There will not be any division by zero.
- The input represents a valid arithmetic expression in reverse polish notation.
- The answer and all intermediate calculations can be represented in a 32-bit integer.

---

## Examples

**Example 1:**
```
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
```

**Example 2:**
```
Input: tokens = ["4","13","5","/","+"]
Output: 6
Explanation: (4 + (13 / 5)) = 6
```

**Example 3:**
```
Input: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
Output: 22
Explanation: ((10 * (6 / ((9 + 3) * -11))) + 17 + 5) = 22
```

---

## Constraints

- `1 <= tokens.length <= 10^4`
- `tokens[i]` is either an operator (`+`, `-`, `*`, `/`) or an integer in the range `[-200, 200]`.
