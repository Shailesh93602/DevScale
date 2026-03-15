// Optimal O(n) Time, O(1) Space — Iterative approach
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

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;

  while (curr !== null) {
    // Save next node
    const nextTemp = curr.next;
    
    // Sever and Reverse the link
    curr.next = prev;
    
    // Slide pointers forward
    prev = curr;
    curr = nextTemp;
  }

  // Once curr is null, prev sits on the new head
  return prev;
}
