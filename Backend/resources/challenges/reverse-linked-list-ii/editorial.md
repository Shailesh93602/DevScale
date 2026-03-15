# Editorial — Reverse Linked List II

## Key Insight

Use a dummy node to handle edge cases (when left = 1). Navigate to the node just before position `left`, then reverse the sublist in-place by repeatedly moving the next node to the front of the reversed portion.

---

## Approach 1: One-Pass Iterative (O(N) Time, O(1) Space)

1. Use a dummy node to simplify edge cases.
2. Advance to the node just before position `left` (call it `prev`).
3. Reverse the sublist using an insertion technique: repeatedly take the next node and place it after `prev`.

```typescript
function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev: ListNode = dummy;

  // Move prev to the node before position 'left'
  for (let i = 1; i < left; i++) {
    prev = prev.next!;
  }

  // 'start' is the first node of the sublist to reverse
  const start = prev.next!;
  let then = start.next;

  // Reverse nodes from left to right
  for (let i = 0; i < right - left; i++) {
    start.next = then!.next;
    then!.next = prev.next;
    prev.next = then;
    then = start.next;
  }

  return dummy.next;
}
```

**Complexity:**
- **Time:** O(N) — single pass through the list.
- **Space:** O(1) — only pointer manipulation.

---

## Approach 2: Collect and Reverse (O(N) Time, O(N) Space)

Collect all values, reverse the subarray from `left-1` to `right-1`, then rebuild. Simpler to understand but uses extra space.

```typescript
function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  const values: number[] = [];
  let current = head;
  while (current !== null) {
    values.push(current.val);
    current = current.next;
  }

  // Reverse the subarray
  let l = left - 1, r = right - 1;
  while (l < r) {
    [values[l], values[r]] = [values[r], values[l]];
    l++;
    r--;
  }

  // Rebuild the list
  current = head;
  for (const val of values) {
    current!.val = val;
    current = current!.next;
  }

  return head;
}
```

**Complexity:**
- **Time:** O(N).
- **Space:** O(N).
