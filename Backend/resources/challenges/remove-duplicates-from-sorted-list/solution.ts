// O(n) Time, O(1) Space — Single Pass
function deleteDuplicates(head: ListNode | null): ListNode | null {
  let curr = head;

  while (curr !== null && curr.next !== null) {
    if (curr.val === curr.next.val) {
      curr.next = curr.next.next;
    } else {
      curr = curr.next;
    }
  }

  return head;
}
