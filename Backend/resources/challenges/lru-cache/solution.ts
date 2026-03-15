class ListNode {
  key: number;
  val: number;
  prev: ListNode | null;
  next: ListNode | null;
  constructor(key: number, val: number) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  private capacity: number;
  private cache: Map<number, ListNode>;
  private head: ListNode;
  private tail: ListNode;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    // Dummy nodes to simplify boundary conditions
    this.head = new ListNode(-1, -1);
    this.tail = new ListNode(-1, -1);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Remove an existing node from the linked list
  private removeNode(node: ListNode) {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  // Insert a node right after the dummy head (Most Recently Used)
  private addToHead(node: ListNode) {
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
      const newNode = new ListNode(key, value);
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

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
