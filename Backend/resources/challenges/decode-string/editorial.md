# Editorial — Decode String

### Use a Stack for Nested Patterns
Whenever you see nested structures (like brackets), a **Stack** or **Recursion** is usually the right approach.

### Logic
As we iterate through the string, we maintain a `currentString` and a `currentNum`.

1.  **Digit**: Update `currentNum`. Note that numbers can be multi-digit (e.g., `100[a]`), so use `currentNum = currentNum * 10 + digit`.
2.  **'[' (Start of nesting)**: 
    - Push the `currentString` we've built so far onto the stack.
    - Push the `currentNum` (the multiplier for the upcoming block) onto the stack.
    - Reset `currentString` and `currentNum` for the new internal block.
3.  **']' (End of nesting)**:
    - Pop the multiplier (`num`) and the previous outer string (`prevString`).
    - Repeat the `currentString` (which represents the content inside the brackets) `num` times.
    - Prepend `prevString` to it. The result becomes the new `currentString`.
4.  **Character**: Simply append it to `currentString`.

### Complexity Analysis
- **Time Complexity**: $O(\text{Output Length})$. We visit each character in the final string at most once.
- **Space Complexity**: $O(\text{Nesting Depth} + \text{Output Length})$. The stack stores strings and counts for each level of nesting.

