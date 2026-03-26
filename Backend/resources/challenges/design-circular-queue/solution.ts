class MyCircularQueue {
  private queue: number[];
  private head: number = 0;
  private tail: number = -1;
  private size: number = 0;
  private k: number;

  constructor(k: number) {
    this.k = k;
    this.queue = new Array(k);
  }

  enQueue(value: number): boolean {
    if (this.isFull()) return false;
    this.tail = (this.tail + 1) % this.k;
    this.queue[this.tail] = value;
    this.size++;
    return true;
  }

  deQueue(): boolean {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.k;
    this.size--;
    return true;
  }

  Front(): number {
    return this.isEmpty() ? -1 : this.queue[this.head];
  }

  Rear(): number {
    return this.isEmpty() ? -1 : this.queue[this.tail];
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  isFull(): boolean {
    return this.size === this.k;
  }
}
