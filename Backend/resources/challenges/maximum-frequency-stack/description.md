# Maximum Frequency Stack

Design a stack-like data structure to push elements to the stack and pop the most frequent element from the stack.

Implement the `FreqStack` class:

- `FreqStack()` constructs an empty frequency stack.
- `push(val)` pushes an integer `val` onto the top of the stack.
- `pop()` removes and returns the most frequent element in the stack. If there is a tie, the element closest to the stack's top is removed and returned.

---

## Examples

**Example 1:**
```
Input:
["FreqStack", "push", "push", "push", "push", "push", "push", "pop", "pop", "pop", "pop"]
[[], [5], [7], [5], [7], [4], [5], [], [], [], []]

Output: [null, null, null, null, null, null, null, 5, 7, 5, 4]

Explanation:
FreqStack freqStack = new FreqStack();
freqStack.push(5); // stack: [5]
freqStack.push(7); // stack: [5, 7]
freqStack.push(5); // stack: [5, 7, 5]
freqStack.push(7); // stack: [5, 7, 5, 7]
freqStack.push(4); // stack: [5, 7, 5, 7, 4]
freqStack.push(5); // stack: [5, 7, 5, 7, 4, 5]
freqStack.pop();   // return 5 (most frequent, appears 3 times)
freqStack.pop();   // return 7 (tied at freq 2, 7 is more recent)
freqStack.pop();   // return 5 (freq 2)
freqStack.pop();   // return 4 (freq 1, most recent among freq-1 elements)
```

---

## Constraints

- `0 <= val <= 10^9`
- At most `2 * 10^4` calls will be made to `push` and `pop`.
- It is guaranteed there will be at least one element before calling `pop`.
