// O(n) Time, O(1) Space — Find Middle, Reverse Second Half, Merge
function reorderList(head: ListNode | null): void {
  if (!head || !head.next || !head.next.next) return;

  // 1. Find the middle using slow/fast pointers
  let slow: ListNode = head;
  let fast: ListNode | null = head;
  while (fast && fast.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // 2. Reverse the second half
  let prev: ListNode | null = null;
  let curr: ListNode | null = slow.next;
  slow.next = null;

  while (curr) {
    const nextTemp = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextTemp;
  }

  // 3. Interleaved merge
  let first: ListNode | null = head;
  let second: ListNode | null = prev;

  while (second) {
    const n1 = first!.next;
    const n2 = second.next;

    first!.next = second;
    second.next = n1;

    first = n1;
    second = n2;
  }
}
