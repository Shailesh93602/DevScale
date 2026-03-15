// O(N) Time, O(1) Space — Two-pointer approach
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

function oddEvenList(head: ListNode | null): ListNode | null {
  if (head === null || head.next === null) return head;

  let odd = head;
  let even = head.next;
  const evenHead = even; // Save the start of even list

  while (even !== null && even.next !== null) {
    odd.next = even.next;    // Link odd to next odd node
    odd = odd.next;
    even.next = odd.next;    // Link even to next even node
    even = even.next;
  }

  // Append even list after odd list
  odd.next = evenHead;

  return head;
}
