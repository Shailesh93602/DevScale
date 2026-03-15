# Editorial — Reorder List

## Approach 1: Array-based approach (O(n) Time, O(n) Space)

The easiest way to reorder the list is simply putting every node into an array, where you can have $O(1)$ random access to the nodes by index. You can then use a two-pointer approach (one starting from the beginning, one from the end of the array) to wire up the `next` pointers.
While this approach works, it costs $O(n)$ extra memory. This is fine in an interview if you're stuck, but not the optimal solution expected.

## Approach 2: Find Middle, Reverse Second Half, Merge (O(n) Time, O(1) Space)

We can achieve the same reordering in $O(1)$ space by using three common linked list techniques combined into one algorithm.

**Step 1: Find the Middle**
We use the standard slow / fast pointer technique to find the exact middle of the linked list. 
If `slow` moves 1 step and `fast` moves 2 steps, when `fast` reaches the end, `slow` will be at the middle.

**Step 2: Reverse the Second Half**
We sever the link between the first half and the second half by setting `slow.next = null`. Then, we take the second half and reverse all its pointers (the exact algorithm used in the 'Reverse Linked List' challenge).

**Step 3: Interleaved Merge**
Now we have two separate linked lists: the first half (moving forwards), and the second half (reversed, meaning it effectively moves backwards from the original perspective).
We simply alternate between picking a node from the first list and picking a node from the second list, until we've rebuilt the entire `reordered` list.

```typescript
function reorderList(head: ListNode | null): void {
  if (!head || !head.next || !head.next.next) return;

  // 1. Find the middle
  let slow: ListNode = head;
  let fast: ListNode | null = head;
  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 2. Reverse the second half
  let prev: ListNode | null = null;
  let curr: ListNode | null = slow.next;
  slow.next = null; // Sever the first half from the second
  
  while (curr) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }

  // 3. Merge the two lists
  let first: ListNode | null = head;
  let second: ListNode | null = prev; // Head of the reversed second half

  while (second) {
    // Save next pointers
    const n1 = first!.next;
    const n2 = second.next;

    // Interleave
    first!.next = second;
    second.next = n1;

    // Advance pointers
    first = n1;
    second = n2;
  }
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. Finding the middle takes $O(n/2)$, reversing takes $O(n/2)$, and merging takes $O(n/2)$. The overall time stays linear.
- **Space Complexity:** **O(1)**. We only allocate a constant number of pointers regardless of list size.
