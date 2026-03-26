class NumArray {
  private nums: number[];
  private tree: number[];

  constructor(nums: number[]) {
    this.nums = [...nums];
    this.tree = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
        this.add(i + 1, nums[i]);
    }
  }

  private add(index: number, val: number) {
    while (index < this.tree.length) {
        this.tree[index] += val;
        index += index & -index;
    }
  }

  private query(index: number): number {
    let sum = 0;
    while (index > 0) {
        sum += this.tree[index];
        index -= index & -index;
    }
    return sum;
  }

  update(index: number, val: number): void {
    const delta = val - this.nums[index];
    this.nums[index] = val;
    this.add(index + 1, delta);
  }

  sumRange(left: number, right: number): number {
    return this.query(right + 1) - this.query(left);
  }
}
