# Editorial — Remove Nth Node From End of List

## Approach 1: Two Iterations (O(n) Time, O(1) Space)

The simplest approach is to traverse the list once to find its total length `L`.
Once we know `L`, we know that the "nth node from the end" is exactly the `(L - n)`th node from the beginning.
We can simply do a second traversal up to the `(L - n)`th node and skip it by pointing `current.next = current.next.next`.

*Edge case:* If `L === n`, it means we are deleting the very first node (the head). In that case, we change `head` to `head.next`.

**Complexity:**
- Time: $O(L)$ where $L$ is the length of the list, doing roughly $2L$ steps.
- Space: $O(1)$.

---

## Approach 2: One Pass with Two Pointers (O(n) Time, O(1) Space) (Optimal)

Can we do this in exactly one pass? Yes!
If we maintain two pointers, a `fast` pointer and a `slow` pointer, and give the `fast` pointer an "n-step head start", an amazing mathematical property arises.

When the `fast` pointer finally reaches the absolute end of the list, the `slow` pointer will be hovering exactly `n` steps backwards into the list... **which is exactly the node we need to remove!**
Technically, we want `slow` to stop right *before* the node we want to remove, so we actually want the gap to be `n + 1` nodes. That's why we use a `dummy` node attached before the actual `head`.

```typescript
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  // Use a dummy node to easily handle deleting the very first real node
  const dummy = new ListNode(0, head);
  
  let slow = dummy;
  let fast = dummy;

  // 1. Give fast an n-step head start.
  // We actually iterate up to n so fast is n nodes ahead of slow
  for (let i = 0; i <= n; i++) {
    fast = fast.next!;
  }

  // 2. Slide both forward until fast falls off the end of the list
  while (fast !== null) {
    slow = slow.next!;
    fast = fast.next;
  }

  // 3. Right now, slow sits right BEFORE the node to remove! Disconnect it.
  slow.next = slow.next!.next;

  // Return the true head of the modified list
  return dummy.next;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. The `fast` pointer traverses the list exactly once. 
- **Space Complexity:** **O(1)** memory.
