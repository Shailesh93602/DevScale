class TreeAncestor {
  private up: number[][]; // up[i][j] is the 2^j-th ancestor of node i
  private depths: number[];
  private LOG: number;

  constructor(n: number, adj: number[][], root: number) {
    this.LOG = Math.ceil(Math.log2(n));
    this.up = Array.from({ length: n }, () => new Array(this.LOG + 1).fill(-1));
    this.depths = new Array(n).fill(0);

    const adjacency = Array.from({ length: n }, () => [] as number[]);
    for (const [u, v] of adj) {
      adjacency[u].push(v);
      adjacency[v].push(u);
    }

    const dfs = (u: number, p: number, d: number) => {
      this.depths[u] = d;
      this.up[u][0] = p;
      for (let j = 1; j <= this.LOG; j++) {
        if (this.up[u][j - 1] !== -1) {
          this.up[u][j] = this.up[this.up[u][j - 1]][j - 1];
        }
      }
      for (const v of adjacency[u]) {
        if (v !== p) dfs(v, u, d + 1);
      }
    };

    dfs(root, -1, 0);
  }

  getLCA(u: number, v: number): number {
    if (this.depths[u] < this.depths[v]) [u, v] = [v, u];

    // 1. Lift u up to the same depth as v
    let diff = this.depths[u] - this.depths[v];
    for (let j = 0; j <= this.LOG; j++) {
      if ((diff >> j) & 1) {
        u = this.up[u][j];
      }
    }

    if (u === v) return u;

    // 2. Lift both nodes together until their parent is the same
    for (let j = this.LOG; j >= 0; j--) {
      if (this.up[u][j] !== this.up[v][j]) {
        u = this.up[u][j];
        v = this.up[v][j];
      }
    }

    return this.up[u][0];
  }
}

