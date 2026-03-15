# Editorial — Add Two Numbers

## Approach: Elementary Math Simulation (O(max(N,M)) Time, O(max(N,M)) Space)

Since the digits are already stored in **reverse order**, the head of each list corresponds to the **least significant digit**. This is perfectly aligned with how we add numbers: we start from the least significant digit and carry over to the next position.

We walk through both lists simultaneously, at each step:
1. Get the values from both current nodes (or 0 if that list has already ended).
2. Compute `sum = l1Val + l2Val + carry`.
3. The new node's value is `sum % 10`.
4. The new `carry` is `Math.floor(sum / 10)`.

We continue until BOTH lists are completely traversed AND the carry is 0. The carry check is critical — for example `5 + 5 = 10`, which produces an extra node with value `1`.

We use a dummy head node to avoid a special case for the result list's head.

```typescript
function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;
  let carry = 0;

  while (l1 !== null || l2 !== null || carry !== 0) {
    const l1Val = l1 ? l1.val : 0;
    const l2Val = l2 ? l2.val : 0;

    const sum = l1Val + l2Val + carry;
    carry = Math.floor(sum / 10);
    curr.next = new ListNode(sum % 10);

    curr = curr.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }

  return dummy.next;
}
```

**Complexity:**
- **Time Complexity:** **O(max(N, M))** where N and M are the lengths of l1 and l2. We traverse both lists completely.
- **Space Complexity:** **O(max(N, M))** for the output list, which can be at most `max(N, M) + 1` nodes long due to the carry.
