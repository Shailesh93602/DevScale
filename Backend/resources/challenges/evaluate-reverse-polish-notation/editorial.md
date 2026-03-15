# Editorial — Evaluate Reverse Polish Notation

## Problem Summary

Evaluate an arithmetic expression given in Reverse Polish Notation (postfix notation).

---

## Approach — Stack (O(n) time, O(n) space) ✅ Optimal

Process tokens left to right. Push numbers onto a stack. When encountering an operator, pop two operands, apply the operator, and push the result back.

```typescript
function evalRPN(tokens: string[]): number {
  const stack: number[] = [];
  const ops = new Set(['+', '-', '*', '/']);

  for (const token of tokens) {
    if (ops.has(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(Math.trunc(a / b)); break;
      }
    } else {
      stack.push(parseInt(token));
    }
  }

  return stack[0];
}
```

**Complexity:**
- Time: **O(n)** — process each token once.
- Space: **O(n)** — stack.

---

## Key Insight

RPN eliminates the need for parentheses and operator precedence rules. A stack naturally handles the evaluation: numbers wait on the stack until their operator arrives. Division truncates toward zero (use `Math.trunc`, not `Math.floor`).
