# Editorial — Copy List with Random Pointer

## Approach: HashMap (O(n) Time, O(n) Space)

The core difficulty here is that we can't simply traverse the list once and set the `random` pointer, because the `random` pointer may point to a node we haven't created yet.

The trick is to do two passes:
1. **First pass**: Traverse the original list and create a copy of each node (with just the `val`). Store the mapping `originalNode -> copyNode` in a HashMap.
2. **Second pass**: Traverse again. Now we use the HashMap to wire up the `next` and `random` pointers of each copy node.

```typescript
function copyRandomList(head: _Node | null): _Node | null {
  if (!head) return null;

  // Map from original node -> copy node
  const nodeMap = new Map<_Node, _Node>();

  // First pass: create all copy nodes
  let curr: _Node | null = head;
  while (curr) {
    nodeMap.set(curr, new _Node(curr.val));
    curr = curr.next;
  }

  // Second pass: set next and random pointers
  curr = head;
  while (curr) {
    const copy = nodeMap.get(curr)!;
    copy.next = curr.next ? nodeMap.get(curr.next)! : null;
    copy.random = curr.random ? nodeMap.get(curr.random)! : null;
    curr = curr.next;
  }

  return nodeMap.get(head)!;
}
```

**Complexity:**
- **Time Complexity:** **O(n)** — we make exactly two passes over the list.
- **Space Complexity:** **O(n)** — the HashMap stores one entry per node.

---

## Follow-up: O(1) Space with Interweaving

You can do this without a HashMap using a clever 3-phase interweaving technique, but the HashMap approach is the expected answer in most interviews.
