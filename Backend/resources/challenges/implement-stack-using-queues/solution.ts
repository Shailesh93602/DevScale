class MyStack {
  private queue: number[] = [];

  constructor() {}

  push(x: number): void {
    const size = this.queue.length;
    this.queue.push(x);
    for (let i = 0; i < size; i++) {
      this.queue.push(this.queue.shift()!);
    }
  }

  pop(): number {
    return this.queue.shift()!;
  }

  top(): number {
    return this.queue[0];
  }

  empty(): boolean {
    return this.queue.length === 0;
  }
}
