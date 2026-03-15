# Editorial — LRU Cache

## Approach: Hash Map + Doubly Linked List (O(1) Time, O(capacity) Space)

To achieve $O(1)$ time complexity for both `get` and `put`, we must maintain the absolute ordering of items by their usage history (Most Recently Used down to Least Recently Used) and be able to jump to any item instantly.

We use two data structures in tandem:
1. **Hash Map** (`Map<number, Node>`): Gives us $O(1)$ random access to any node based on its `key`.
2. **Doubly Linked List**: Maintains the usage order. We keep track of a `head` (most recently used) and a `tail` (least recently used). When an item is accessed or added, we splice it out of its current position and attach it to the `head`. When we hit capacity and add a new item, we chop off the `tail`.

Using a Doubly Linked List instead of a Singly Linked List is crucial because to remove a node from the middle of the list in $O(1)$ time, we need immediate access to its `prev` pointer.

To avoid nasty null-checks, we use two **dummy nodes**: a `head` dummy and a `tail` dummy. All real nodes sit between them.

```typescript
class Node {
  key: number;
  val: number;
  prev: Node | null;
  next: Node | null;
  constructor(key: number, val: number) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  private capacity: number;
  private cache: Map<number, Node>;
  private head: Node;
  private tail: Node;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    // Dummy nodes to simplify boundary conditions
    this.head = new Node(-1, -1);
    this.tail = new Node(-1, -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Helper to remove an existing node from the linked list
  private removeNode(node: Node) {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  // Helper to insert a node right after the dummy head (Most Recently Used)
  private addToHead(node: Node) {
    const temp = this.head.next!;
    this.head.next = node;
    node.prev = this.head;
    node.next = temp;
    temp.prev = node;
  }

  get(key: number): number {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      // Mark as MRU
      this.removeNode(node);
      this.addToHead(node);
      return node.val;
    }
    return -1;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      // Update existing
      const node = this.cache.get(key)!;
      node.val = value;
      // Mark as MRU
      this.removeNode(node);
      this.addToHead(node);
    } else {
      // Create new
      const newNode = new Node(key, value);
      this.cache.set(key, newNode);
      this.addToHead(newNode);

      // Evict LRU if over capacity
      if (this.cache.size > this.capacity) {
        const lru = this.tail.prev!;
        this.removeNode(lru);
        this.cache.delete(lru.key);
      }
    }
  }
}
```

**Complexity:**
- **Time Complexity:** **O(1)** for both `get` and `put`. Hash Map operations and Doubly Linked List pointer assignments are all constant time.
- **Space Complexity:** **O(capacity)** to store the nodes in the map and the list.
