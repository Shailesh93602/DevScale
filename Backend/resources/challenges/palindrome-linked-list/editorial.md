# Editorial — Palindrome Linked List

## Approach: Find Middle + Reverse + Compare (O(n) Time, O(1) Space)

We combine three linked-list techniques:

**Step 1: Find the middle** using slow/fast pointers.

**Step 2: Reverse the second half** of the list in-place.

**Step 3: Compare** both halves node-by-node.

```typescript
function isPalindrome(head: ListNode | null): boolean {
  if (!head || !head.next) return true;

  // Step 1: Find the middle
  let slow: ListNode = head;
  let fast: ListNode | null = head;
  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // Step 2: Reverse second half
  let prev: ListNode | null = null;
  let curr: ListNode | null = slow;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  // Step 3: Compare first and reversed second half
  let left: ListNode | null = head;
  let right: ListNode | null = prev;
  while (right) {
    if (left!.val !== right.val) return false;
    left = left!.next;
    right = right.next;
  }

  return true;
}
```

**Complexity:**
- **Time Complexity:** **O(n)** — one pass to find middle, one to reverse, one to compare.
- **Space Complexity:** **O(1)** — only pointers used, no extra data structures.
