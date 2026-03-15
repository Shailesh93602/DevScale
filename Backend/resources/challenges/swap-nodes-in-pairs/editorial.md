# Editorial — Swap Nodes in Pairs

## Approach 1: Iterative with Dummy Node (O(n) Time, O(1) Space)

Whenever we need to manipulate pointers in a way that might change the `head` of the list, using a dummy node is standard practice to avoid messy edge cases.

We iterate through the list using a `prev` pointer, initialized to the `dummy` node. As long as there are at least two nodes ahead of `prev` (meaning `prev.next` and `prev.next.next` exist), we can swap them.

Let `first = prev.next` and `second = prev.next.next`.
To swap them:
1. `prev` needs to point to `second`.
2. `first` needs to point to whatever came after `second` (`second.next`).
3. `second` needs to point to `first`.

Once swapped, we advance `prev` to point to `first` (since `first` is now the second node in the pair, positioned right before the next pair to swap).

```typescript
function swapPairs(head: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev = dummy;

  while (prev.next !== null && prev.next.next !== null) {
    const first = prev.next;
    const second = prev.next.next;

    // Swap pointers
    prev.next = second;
    first.next = second.next;
    second.next = first;

    // Move prev forward
    prev = first;
  }

  return dummy.next;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. We iterate through the list exactly once.
- **Space Complexity:** **O(1)**. Only a few pointers are used.

---

## Approach 2: Recursive (O(n) Time, O(n) Space)

This problem has a beautifully simple recursive definition. 
If we isolate the very first two nodes (`head` and `head.next`), we want `head.next` to become the new head. What happens to the old `head`? It should be linked to the result of recursively swapping the rest of the list!

```typescript
function swapPairs(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) {
    return head;
  }

  const first = head;
  const second = head.next;

  // Swapping
  first.next = swapPairs(second.next);
  second.next = first;

  // Now the head is the second node
  return second;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. Every node is visited once.
- **Space Complexity:** **O(n)**. The recursive call stack reaches a depth of $O(n/2)$.
