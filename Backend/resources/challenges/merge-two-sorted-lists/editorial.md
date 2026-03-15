# Editorial — Merge Two Sorted Lists

## Approach 1: Iterative with Dummy Node (O(N) Time, O(1) Space)

We want to merge two sorted lists. Instead of creating new nodes, we can just rearrange the `next` pointers of the existing nodes.

A common pattern for linked list operations is a `dummy` head constructor. We create a fake "dummy" node so we don't have to write annoying edge case `if (head === null)` logic. Our `current` pointer starts at `dummy`.

1. While both `list1` and `list2` are not null:
   - Compare `list1.val` and `list2.val`.
   - Set `current.next` to the smaller node.
   - Advance the pointer of the smaller node (`list1` or `list2`) forward by one.
   - Advance `current` forward by one.
2. If `list1` or `list2` becomes null (meaning one list was shorter than the other), just attach the entire remainder of the non-null list to `current.next`. Since it's already sorted, the whole tail is perfectly placed!
3. Return `dummy.next` (which skips the fake node and returns the actual start of the merged list).

```typescript
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let current = dummy;

  while (list1 !== null && list2 !== null) {
    if (list1.val < list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  // Attach remaining 
  if (list1 !== null) {
    current.next = list1;
  } else if (list2 !== null) {
    current.next = list2;
  }

  return dummy.next;
}
```

**Complexity:**
- **Time Complexity:** **O(N + M)** where N and M are the lengths of `list1` and `list2`. We traverse both lists at most once.
- **Space Complexity:** **O(1)** memory. We simply rearrange pointers.

---

## Approach 2: Recursive (O(N) Time, O(N) Space)

You can view the merge process as a smaller subproblem. 
Suppose `list1[0] < list2[0]`. Then `list1[0]` is the head of the new list. The rest of the new list is exactly the result of `merge(list1.next, list2)`.

```typescript
function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  if (!list1) return list2;
  if (!list2) return list1;

  if (list1.val < list2.val) {
    list1.next = mergeTwoLists(list1.next, list2);
    return list1;
  } else {
    list2.next = mergeTwoLists(list1, list2.next);
    return list2;
  }
}
```

**Complexity:**
- **Time Complexity:** **O(N + M)**.
- **Space Complexity:** **O(N + M)** memory on the call stack tracking each recursive call before unwinding.
