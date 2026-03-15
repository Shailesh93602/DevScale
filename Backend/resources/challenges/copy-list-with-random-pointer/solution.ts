// O(n) Time, O(n) Space — HashMap two-pass
function copyRandomList(head: _Node | null): _Node | null {
  if (!head) return null;

  const nodeMap = new Map<_Node, _Node>();

  // First pass: create all copy nodes
  let curr: _Node | null = head;
  while (curr) {
    nodeMap.set(curr, new _Node(curr.val));
    curr = curr.next;
  }

  // Second pass: wire up next and random
  curr = head;
  while (curr) {
    const copy = nodeMap.get(curr)!;
    copy.next = curr.next ? nodeMap.get(curr.next)! : null;
    copy.random = curr.random ? nodeMap.get(curr.random)! : null;
    curr = curr.next;
  }

  return nodeMap.get(head)!;
}
