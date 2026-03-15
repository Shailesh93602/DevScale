// Optimal solution: O(1) per operation — Frequency groups with stacks
class FreqStack {
  private freq: Map<number, number> = new Map();
  private groupStack: Map<number, number[]> = new Map();
  private maxFreq: number = 0;

  push(val: number): void {
    const f = (this.freq.get(val) || 0) + 1;
    this.freq.set(val, f);
    this.maxFreq = Math.max(this.maxFreq, f);
    if (!this.groupStack.has(f)) this.groupStack.set(f, []);
    this.groupStack.get(f)!.push(val);
  }

  pop(): number {
    const stack = this.groupStack.get(this.maxFreq)!;
    const val = stack.pop()!;
    this.freq.set(val, this.freq.get(val)! - 1);
    if (stack.length === 0) this.maxFreq--;
    return val;
  }
}
