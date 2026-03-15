class TrieNode {
  children = new Map<string, TrieNode>();
  sum = 0;
}

export class MapSum {
  private readonly root: TrieNode;
  private readonly map: Map<string, number>;

  constructor() {
    this.root = new TrieNode();
    this.map = new Map();
  }

  insert(key: string, val: number): void {
    const diff = val - (this.map.get(key) || 0);
    this.map.set(key, val);

    let curr = this.root;
    for (const char of key) {
      if (!curr.children.has(char)) {
        curr.children.set(char, new TrieNode());
      }
      curr = curr.children.get(char)!;
      curr.sum += diff;
    }
  }

  sum(prefix: string): number {
    let curr = this.root;
    for (const char of prefix) {
      if (!curr.children.has(char)) {
        return 0;
      }
      curr = curr.children.get(char)!;
    }
    return curr.sum;
  }
}
