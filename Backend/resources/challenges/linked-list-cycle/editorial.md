# Editorial — Linked List Cycle

## Approach 1: Hash Set (O(n) Time, O(n) Space)

The easiest way to check if we've visited a node before is to keep a record of all the nodes we visit.
We can iterate through the linked list, adding each node reference to a Hash Set.
If we ever reach a node that is already inside the Hash Set, we have found a cycle!

If we reach `null`, the list has an end and thus no cycle.

```typescript
function hasCycle(head: ListNode | null): boolean {
  const visited = new Set<ListNode>();
  let current = head;

  while (current !== null) {
    if (visited.has(current)) {
      return true;
    }
    visited.add(current);
    current = current.next;
  }

  return false;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. We visit each of the $n$ elements in the list at most once. Adding a node to the hash set costs only $O(1)$ time.
- **Space Complexity:** **O(n)**. Required to store the nodes in the Hash Set.

---

## Approach 2: Floyd's Cycle-Finding Algorithm (Fast & Slow Pointers) (O(1) Space)

Imagine two runners on a race track. One is a fast runner, and one is a slow runner. 
If the track is just a straight line, the fast runner will reach the end first.
If the track is a circle, passing the finish line means you just keep running... and eventually, because the fast runner is moving faster, they will "lap" the slow runner!

We can apply this logic to our linked list. We create two pointers:
- `slow` moves 1 step at a time.
- `fast` moves 2 steps at a time.

If there is no cycle, `fast` will eventually reach the end of the list (`null`).
If there is a cycle, `fast` will eventually wrap around and land on the exact same node as `slow`.

```typescript
function hasCycle(head: ListNode | null): boolean {
  if (head === null) return false;

  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next!; // Moves 1 step
    fast = fast.next.next!; // Moves 2 steps
    
    // If they meet, there is a cycle
    if (slow === fast) {
      return true;
    }
  }

  return false;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**.
- **Space Complexity:** **O(1)** memory, as we only use two pointers.
