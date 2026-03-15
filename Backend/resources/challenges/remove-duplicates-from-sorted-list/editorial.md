# Editorial — Remove Duplicates from Sorted List

## Approach: Single Pass (O(n) Time, O(1) Space)

Because the list is **sorted**, all duplicate values are guaranteed to be **adjacent** to each other. This drastically simplifies our task — we never have to compare a node to anything other than its immediate neighbor!

We traverse the list using a single pointer `curr`:
- If `curr.val` equals `curr.next.val`, the two are duplicates. We remove the next node by setting `curr.next = curr.next.next`. We do NOT advance `curr` yet, because the new `curr.next` could itself be another duplicate of `curr`.
- If they are different, we advance `curr` to `curr.next`.

```typescript
function deleteDuplicates(head: ListNode | null): ListNode | null {
  let curr = head;

  while (curr !== null && curr.next !== null) {
    if (curr.val === curr.next.val) {
      // Skip the duplicate node
      curr.next = curr.next.next;
    } else {
      // Values are different, move forward
      curr = curr.next;
    }
  }

  return head;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. We touch each node at most once.
- **Space Complexity:** **O(1)**. We only use one pointer `curr`.
