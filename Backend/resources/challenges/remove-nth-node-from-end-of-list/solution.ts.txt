// Optimal O(N) Time, O(1) Space — One pass two pointers
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let slow = dummy;
  let fast = dummy;

  // Let fast move n+1 steps ahead first, so that the gap between 
  // slow and fast is exactly n nodes when fast hits the end.
  // This positions slow right *before* the node to remove.
  for (let i = 0; i <= n; i++) {
    fast = fast.next!;
  }

  // Slide both forward
  while (fast !== null) {
    slow = slow.next!;
    fast = fast.next;
  }

  // Disconnect the nth node from the end
  if (slow.next) {
    slow.next = slow.next.next;
  }

  return dummy.next;
}
