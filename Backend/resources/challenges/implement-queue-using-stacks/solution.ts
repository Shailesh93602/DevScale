class MyQueue {
  private stack1: number[] = [];
  private stack2: number[] = [];

  constructor() {}

  push(x: number): void {
    this.stack1.push(x);
  }

  pop(): number {
    this.move();
    return this.stack2.pop()!;
  }

  peek(): number {
    this.move();
    return this.stack2[this.stack2.length - 1];
  }

  empty(): boolean {
    return this.stack1.length === 0 && this.stack2.length === 0;
  }

  private move(): void {
    if (this.stack2.length === 0) {
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop()!);
      }
    }
  }
}
