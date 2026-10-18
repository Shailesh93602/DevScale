// O(N) Time, O(1) Space — One-pass in-place reversal
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

function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev: ListNode = dummy;

  // Move prev to the node just before position 'left'
  for (let i = 1; i < left; i++) {
    prev = prev.next!;
  }

  // 'start' is the first node of the sublist to reverse
  const start = prev.next!;
  let then = start.next;

  // Reverse by repeatedly moving 'then' to after 'prev'
  for (let i = 0; i < right - left; i++) {
    start.next = then!.next;
    then!.next = prev.next;
    prev.next = then;
    then = start.next;
  }

  return dummy.next;
}
