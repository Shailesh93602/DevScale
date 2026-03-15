// O(max(N,M)) Time, O(max(N,M)) Space — Digit-by-digit simulation
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
