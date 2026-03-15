# Editorial — Odd Even Linked List

## Key Insight

Maintain two separate chains: one for odd-indexed nodes and one for even-indexed nodes. Walk through the list, linking odd nodes together and even nodes together. At the end, attach the even chain after the odd chain.

---

## Approach: Two Pointers (O(N) Time, O(1) Space)

Use `odd` and `even` pointers to build two separate sublists, then connect them.

```typescript
function oddEvenList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  let odd = head;
  let even = head.next;
  const evenHead = even; // Save the start of the even list

  while (even !== null && even.next !== null) {
    odd.next = even.next;    // Link odd to the next odd
    odd = odd.next;
    even.next = odd.next;    // Link even to the next even
    even = even.next;
  }

  // Append even list after odd list
  odd.next = evenHead;

  return head;
}
```

**Complexity:**
- **Time:** O(N) — single pass through the list.
- **Space:** O(1) — only pointer manipulation, no extra data structures.

---

## Why This Works

Consider the list: 1 -> 2 -> 3 -> 4 -> 5

After processing:
- Odd chain: 1 -> 3 -> 5
- Even chain: 2 -> 4

Connect: 1 -> 3 -> 5 -> 2 -> 4

The key observation is that by alternating the linking, we naturally separate odd and even indexed nodes while preserving their relative order within each group.
