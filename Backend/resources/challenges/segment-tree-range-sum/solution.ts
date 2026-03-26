class SegmentTree {
  private tree: number[];
  private lazy: number[];
  private n: number;

  constructor(nums: number[]) {
    this.n = nums.length;
    this.tree = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(nums, 1, 0, this.n - 1);
  }

  private build(nums: number[], node: number, start: number, end: number) {
    if (start === end) {
      this.tree[node] = nums[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this.build(nums, 2 * node, start, mid);
    this.build(nums, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  private push(node: number, start: number, end: number) {
    if (this.lazy[node] !== 0) {
      this.tree[node] += (end - start + 1) * this.lazy[node];
      if (start !== end) {
        this.lazy[2 * node] += this.lazy[node];
        this.lazy[2 * node + 1] += this.lazy[node];
      }
      this.lazy[node] = 0;
    }
  }

  public update(l: number, r: number, val: number) {
    this._update(1, 0, this.n - 1, l, r, val);
  }

  private _update(node: number, start: number, end: number, l: number, r: number, val: number) {
    this.push(node, start, end);
    if (start > end || start > r || end < l) return;

    if (start >= l && end <= r) {
      this.lazy[node] += val;
      this.push(node, start, end);
      return;
    }

    const mid = Math.floor((start + end) / 2);
    this._update(2 * node, start, mid, l, r, val);
    this._update(2 * node + 1, mid + 1, end, l, r, val);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  public query(l: number, r: number): number {
    return this._query(1, 0, this.n - 1, l, r);
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    this.push(node, start, end);
    if (start > end || start > r || end < l) return 0;

    if (start >= l && end <= r) return this.tree[node];

    const mid = Math.floor((start + end) / 2);
    return this._query(2 * node, start, mid, l, r) + this._query(2 * node + 1, mid + 1, end, l, r);
  }
}

