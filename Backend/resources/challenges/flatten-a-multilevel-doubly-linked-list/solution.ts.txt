// O(n) Time, O(n) Space — Iterative DFS with Stack
function flatten(head: _Node | null): _Node | null {
  if (!head) return null;

  const stack: _Node[] = [head];
  let prev: _Node | null = null;

  while (stack.length > 0) {
    const curr = stack.pop()!;

    // Connect prev and curr
    if (prev) {
      prev.next = curr;
      curr.prev = prev;
    }

    // Push next first, so child is processed before next
    if (curr.next) stack.push(curr.next);
    if (curr.child) {
      stack.push(curr.child);
      curr.child = null; // Important: Clear the child pointer
    }

    prev = curr;
  }

  return head;
}
