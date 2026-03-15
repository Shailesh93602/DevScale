// O(N log N) Time, O(log N) Space — Top-down merge sort
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

function sortList(head: ListNode | null): ListNode | null {
  // Base case: empty or single node
  if (head === null || head.next === null) return head;

  // Find middle using slow/fast pointers
  let slow: ListNode = head;
  let fast: ListNode | null = head.next;
  while (fast !== null && fast.next !== null) {
    slow = slow.next!;
    fast = fast.next.next;
  }

  // Split the list at the middle
  const mid = slow.next;
  slow.next = null;

  // Recursively sort both halves
  const left = sortList(head);
  const right = sortList(mid);

  // Merge sorted halves
  return merge(left, right);
}

function merge(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }

  current.next = l1 !== null ? l1 : l2;
  return dummy.next;
}
