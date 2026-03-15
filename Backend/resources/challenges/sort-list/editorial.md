# Editorial — Sort List

## Key Insight

Merge sort is ideal for linked lists because splitting a list in half is O(N) using the slow/fast pointer technique, and merging two sorted lists is O(N) without extra space. This gives us O(N log N) time.

---

## Approach 1: Top-Down Merge Sort (O(N log N) Time, O(log N) Space)

1. Find the middle using slow/fast pointers.
2. Recursively sort both halves.
3. Merge the two sorted halves.

```typescript
function sortList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  // Find middle
  let slow: ListNode = head;
  let fast: ListNode | null = head.next;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  const mid = slow.next;
  slow.next = null; // Split the list

  const left = sortList(head);
  const right = sortList(mid);

  return merge(left, right);
}

function merge(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }

  current.next = l1 !== null ? l1 : l2;
  return dummy.next;
}
```

**Complexity:**
- **Time:** O(N log N) — divide into halves log N times, merge is O(N) each time.
- **Space:** O(log N) — recursion stack depth.

---

## Approach 2: Bottom-Up Merge Sort (O(N log N) Time, O(1) Space)

Instead of recursion, iteratively merge sublists of increasing size (1, 2, 4, 8, ...). This avoids recursion overhead and achieves O(1) space.

```typescript
function sortList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  // Count the length
  let length = 0;
  let node = head;
  while (node !== null) {
    length++;
    node = node.next;
  }

  const dummy = new ListNode(0);
  dummy.next = head;

  for (let size = 1; size < length; size *= 2) {
    let current = dummy.next;
    let tail = dummy;

    while (current !== null) {
      const left = current;
      const right = split(left, size);
      current = split(right, size);
      const [merged, mergedTail] = mergeAndReturnTail(left, right);
      tail.next = merged;
      tail = mergedTail;
    }
  }

  return dummy.next;
}
```

**Complexity:**
- **Time:** O(N log N).
- **Space:** O(1) — no recursion.
