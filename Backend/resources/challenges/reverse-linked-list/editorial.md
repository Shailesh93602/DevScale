# Editorial — Reverse Linked List

## Approach 1: Iterative (O(n) Time, O(1) Space)

The most common and interview-friendly approach to reverse a linked list is the iterative approach using three pointers: `prev`, `curr`, and `nextTemp`.

While iterating through the list, at each node, we want to update its `next` pointer to point to the `prev` node instead of the next node. However, since doing so will disconnect the rest of the list, we must first temporarily save `curr.next`.

```typescript
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    // Save next node before severing the link
    const nextTemp = curr.next;
    
    // Reverse the link
    curr.next = prev;
    
    // Slide pointers forward
    prev = curr;
    curr = nextTemp;
  }

  // Once curr is null, prev is sitting on the new head
  return prev;
}
```

**Complexity:**
- **Time Complexity:** **O(n)** where `n` is the number of nodes in the list. We touch every node exactly once.
- **Space Complexity:** **O(1)**. We only allocate three pointers regardless of list length.

---

## Approach 2: Recursive (O(n) Time, O(n) Space)

The recursive approach is elegant but suffers from call stack overhead.
The recursive idea is: 
1. Reverse the rest of the list (`head.next`).
2. Have the node that *was* next to you suddenly point back to you.
3. Make sure to set your own `next` to `null` to avoid cycles.

```typescript
function reverseList(head: ListNode | null): ListNode | null {
  // Base case: empty list or list of size 1
  if (head === null || head.next === null) {
    return head;
  }

  // Recurse to the very end of the list. p will be the NEW head (last element).
  const p = reverseList(head.next);
  
  // At this level of recursive unrolling, head.next is STILL the node AFTER head.
  // We want to make that node point BACK to head.
  head.next.next = head;
  
  // And we want head to point to null (which serves as the new end, 
  // or will be overwritten in higher recursive unrollings).
  head.next = null;
  
  return p;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. Each node is touched once during recursion and once during unrolling.
- **Space Complexity:** **O(n)**. The call stack will grow up to `n` recursive frames deep before unwinding.
