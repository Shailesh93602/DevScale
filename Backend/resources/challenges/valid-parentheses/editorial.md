# Editorial — Valid Parentheses

## Problem Summary

Determine if a string of bracket characters is "valid" — every open bracket must be closed by the correct type in the correct order.

---

## Key Insight

At any point while reading left to right, the **most recently opened** bracket is the one that must be closed **next**. This is a classic **Last In, First Out** (LIFO) problem — perfect for a stack.

---

## Approach — Stack (Optimal)

**Algorithm:**
1. Create an empty stack and a map: closing → matching opening (`')' → '('`, etc.)
2. For each character `c` in `s`:
   - If `c` is an **opening bracket** (`(`, `[`, `{`), push it onto the stack.
   - If `c` is a **closing bracket**, check if the stack is non-empty AND the top of the stack is the matching open bracket. If not → return `false`. If yes → pop the stack.
3. At the end, return `stack.length === 0` (all brackets were matched).

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else {
      // closing bracket
      if (stack.length === 0 || stack[stack.length - 1] !== map[char]) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.length === 0;
}
```

**Complexity:**
- Time: **O(n)** — single pass through the string.
- Space: **O(n)** — stack in worst case holds all characters (e.g., `"(((((("`).

---

## Edge Cases to Handle

| Input | Expected | Reason |
|-------|----------|--------|
| `")"` | `false` | Closing bracket with empty stack |
| `"("` | `false` | Unclosed bracket at end |
| `"([)]"` | `false` | Wrong close order |
| `"{[]}"` | `true` | Properly nested different types |
| `""` (empty) | `true` | Empty string is trivially valid |

---

## Alternative: Counter Approach (only for single bracket type)

If the problem only had `()`, you could use a counter: `+1` for `(`, `-1` for `)`. Return `counter === 0 && never went negative`. This does **not** generalize to multiple bracket types.

---

## Real-World Application

This exact algorithm powers:
- **Compiler syntax checkers** (matching braces in code)
- **XML/HTML validators** (matching open/close tags)
- **Math expression parsers** (balanced parentheses in formulas)
