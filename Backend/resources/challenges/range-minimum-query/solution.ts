class SparseTable {
  private st: number[][];
  private logs: number[];

  constructor(nums: number[]) {
    const n = nums.length;
    const K = Math.floor(Math.log2(n)) + 1;
    this.st = Array.from({ length: K }, () => new Array(n));
    this.logs = new Array(n + 1);

    // Precompute logs for O(1) query
    this.logs[1] = 0;
    for (let i = 2; i <= n; i++) {
      this.logs[i] = this.logs[Math.floor(i / 2)] + 1;
    }

    // Base case: length 1 ranges
    for (let i = 0; i < n; i++) {
        this.st[0][i] = nums[i];
    }

    // Dynamic Programming to build the table
    for (let j = 1; j < K; j++) {
      for (let i = 0; i + (1 << j) <= n; i++) {
        this.st[j][i] = Math.min(
            this.st[j - 1][i], 
            this.st[j - 1][i + (1 << (j - 1))]
        );
      }
    }
  }

  public query(l: number, r: number): number {
    const j = this.logs[r - l + 1];
    return Math.min(
        this.st[j][l], 
        this.st[j][r - (1 << j) + 1]
    );
  }
}
