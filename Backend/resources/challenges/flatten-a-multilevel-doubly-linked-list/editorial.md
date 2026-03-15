# Editorial — Flatten a Multilevel Doubly Linked List

## Approach: Depth-First Search (DFS) using a Stack (O(N) Time, O(N) Space)

The structure of this multilevel list is essentially a binary tree, where the `child` pointer acts like a "left" branch and the `next` pointer acts like a "right" branch.
Flattening the list so that child nodes appear *before* the next nodes is equivalent to a **Pre-order Traversal** (visit node -> visit child -> visit next).

We can use a Stack to implement this iteratively:

1. Push the `head` node onto the stack.
2. Maintain a `prev` pointer (initially `null`) to easily wire up the doubly linked list.
3. While the stack is not empty:
   - Pop the `curr` node.
   - Wire up `prev` and `curr` together.
   - Since a stack is Last-In-First-Out (LIFO), we want to process the `child` *before* the `next`. Therefore, we must push `curr.next` onto the stack **FIRST**, and then push `curr.child` onto the stack **SECOND**.
   - Clear out the `curr.child` pointer as required.
   - Update `prev = curr`.

```typescript
function flatten(head: _Node | null): _Node | null {
  if (!head) return null;

  const stack: _Node[] = [head];
  let prev: _Node | null = null;

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // Wire up current node to previous node
    if (prev) {
      prev.next = curr;
      curr.prev = prev;
    }

    // Push NEXT first, then CHILD (so child gets popped first)
    if (curr.next) {
      stack.push(curr.next);
    }
    if (curr.child) {
      stack.push(curr.child);
      curr.child = null; // Clear child pointer
    }

    prev = curr;
  }

  return head;
}
```

**Complexity:**
- **Time Complexity:** **O(N)** where $N$ is the total number of nodes in the multilevel structure. We visit each node exactly once.
- **Space Complexity:** **O(N)** in the worst case where every node has a `child` forming a deeply nested structure (recursive stack depth).
