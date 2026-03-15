// O(n) Time, O(1) Space — Find Middle, Reverse Second Half, Compare
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

  // Step 3: Compare both halves
  let left: ListNode | null = head;
  let right: ListNode | null = prev;
  while (right) {
    if (left!.val !== right.val) return false;
    left = left!.next;
    right = right.next;
  }

  return true;
}
