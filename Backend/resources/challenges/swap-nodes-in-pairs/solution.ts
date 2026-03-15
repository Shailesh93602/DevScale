// O(n) Time, O(1) Space — Iterative with Dummy Node
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

function swapPairs(head: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev = dummy;

  while (prev.next !== null && prev.next.next !== null) {
    const first = prev.next;
    const second = prev.next.next;

    // Output should be: prev -> second -> first -> (rest...)
    prev.next = second;
    first.next = second.next;
    second.next = first;

    // Advance prev to be the 'first' node (which is now in second position)
    prev = first;
  }

  return dummy.next;
}
