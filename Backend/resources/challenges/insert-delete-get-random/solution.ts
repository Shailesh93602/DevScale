class RandomizedSet {
  private map: Map<number, number> = new Map();
  private list: number[] = [];

  constructor() {}

  insert(val: number): boolean {
    if (this.map.has(val)) return false;
    this.map.set(val, this.list.length);
    this.list.push(val);
    return true;
  }

  remove(val: number): boolean {
    if (!this.map.has(val)) return false;
    const index = this.map.get(val)!;
    const lastVal = this.list[this.list.length - 1];

    // Swap the element to be removed with the last element
    this.list[index] = lastVal;
    this.map.set(lastVal, index);

    // Remove the last element
    this.list.pop();
    this.map.delete(val);
    return true;
  }

  getRandom(): number {
    const randomIndex = Math.floor(Math.random() * this.list.length);
    return this.list[randomIndex];
  }
}

