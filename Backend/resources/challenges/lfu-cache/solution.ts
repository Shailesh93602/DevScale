class LinkedNode {
  key: number;
  val: number;
  freq: number;
  prev: LinkedNode | null = null;
  next: LinkedNode | null = null;
  constructor(key: number, val: number) {
    this.key = key;
    this.val = val;
    this.freq = 1;
  }
}

class DoublyLinkedList {
  head: LinkedNode;
  tail: LinkedNode;
  size: number = 0;
  constructor() {
    this.head = new LinkedNode(0, 0);
    this.tail = new LinkedNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addNode(node: LinkedNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
    this.size++;
  }

  removeNode(node: LinkedNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    this.size--;
  }

  removeTail(): LinkedNode | null {
    if (this.size === 0) return null;
    const node = this.tail.prev!;
    this.removeNode(node);
    return node;
  }
}

class LFUCache {
  capacity: number;
  size: number = 0;
  minFreq: number = 0;
  keyMap: Map<number, LinkedNode> = new Map();
  freqMap: Map<number, DoublyLinkedList> = new Map();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): number {
    const node = this.keyMap.get(key);
    if (!node) return -1;
    this.updateFreq(node);
    return node.val;
  }

  put(key: number, value: number): void {
    if (this.capacity === 0) return;
    const node = this.keyMap.get(key);
    if (node) {
      node.val = value;
      this.updateFreq(node);
    } else {
      if (this.size === this.capacity) {
        const minList = this.freqMap.get(this.minFreq)!;
        const removed = minList.removeTail()!;
        this.keyMap.delete(removed.key);
        this.size--;
      }
      const newNode = new LinkedNode(key, value);
      this.keyMap.set(key, newNode);
      this.minFreq = 1;
      let list = this.freqMap.get(1);
      if (!list) {
        list = new DoublyLinkedList();
        this.freqMap.set(1, list);
      }
      list.addNode(newNode);
      this.size++;
    }
  }

  private updateFreq(node: LinkedNode) {
    const oldFreq = node.freq;
    const oldList = this.freqMap.get(oldFreq)!;
    oldList.removeNode(node);
    if (oldFreq === this.minFreq && oldList.size === 0) {
      this.minFreq++;
    }
    node.freq++;
    let newList = this.freqMap.get(node.freq);
    if (!newList) {
      newList = new DoublyLinkedList();
      this.freqMap.set(node.freq, newList);
    }
    newList.addNode(node);
  }
}
