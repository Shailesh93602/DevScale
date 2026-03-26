class CacheNode {
  key: string;
  value: any;
  expiry: number | null;
  prev: CacheNode | null = null;
  next: CacheNode | null = null;

  constructor(key: string, value: any, ttl?: number) {
    this.key = key;
    this.value = value;
    this.expiry = ttl ? Date.now() + (ttl * 1000) : null;
  }
}

class DistributedCache {
  private capacity: number;
  private map: Map<string, CacheNode> = new Map();
  private head: CacheNode = new CacheNode("", null);
  private tail: CacheNode = new CacheNode("", null);

  constructor(capacity: number) {
    this.capacity = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: string): any {
    const node = this.map.get(key);
    if (!node) return null;

    if (node.expiry && Date.now() > node.expiry) {
      this.removeNode(node);
      this.map.delete(key);
      return null;
    }

    this.moveToHead(node);
    return node.value;
  }

  set(key: string, value: any, ttl?: number): void {
    let node = this.map.get(key);
    if (node) {
      node.value = value;
      node.expiry = ttl ? Date.now() + (ttl * 1000) : null;
      this.moveToHead(node);
    } else {
      if (this.map.size >= this.capacity) {
        const lru = this.tail.prev!;
        this.removeNode(lru);
        this.map.delete(lru.key);
      }
      const newNode = new CacheNode(key, value, ttl);
      this.addNode(newNode);
      this.map.set(key, newNode);
    }
  }

  private addNode(node: CacheNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: CacheNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToHead(node: CacheNode) {
    this.removeNode(node);
    this.addNode(node);
  }
}
