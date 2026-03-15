# Editorial — Map Sum Pairs

## Approach: Trie with Summation (O(K) Time per query, O(K) Space)

The problem asks for a data structure that allows inserting a string key with an associated integer value, and quickly querying the sum of all values that share a given string prefix.

A **Hash Map** alone isn't enough because finding all keys with a specific prefix would take `O(Number of Keys * Prefix Length)`.

A **Trie (Prefix Tree)** is specifically designed for analyzing prefixes. We can structure our Trie in a way that avoids doing deep recursive searches every time `sum()` is called.

### Optimized Storage
Instead of storing the `value` solely at the end of the word's path, we can store a `sum` at *every single node* along the path!
- When inserting `("apple", 3)`, the nodes `a`, `p`, `p`, `l`, `e` each get their `sum` incremented by 3.
- When `sum("app")` is queried, we just march down to the second `p` node. The `sum` stored there securely holds the combined value of all words that passed through it. We just return `curr.sum` immediately in `O(Prefix Length)` time!

### Overriding Logic
The only gotcha is the ability to override keys. If `("apple", 3)` was inserted, and later `("apple", 5)` is inserted, the `sum` at `a, p, p, l, e` should only increase by `+2`.

To handle this efficiently, we use a standard `Map` alongside our Trie.
1. When `insert(key, newValue)` is called, check if `key` exists in the Map.
2. Determine `difference = newValue - oldValue` (if it didn't exist, `oldValue = 0`).
3. Traverse down the Trie for `key`, adding `difference` to `curr.sum` at each node.
4. Update the Map with the `newValue`.

```typescript
class TrieNode {
  children = new Map<string, TrieNode>();
  sum = 0;
}

class MapSum {
  root = new TrieNode();
  map = new Map<string, number>();

  insert(key: string, val: number): void {
    const diff = val - (this.map.get(key) || 0);
    this.map.set(key, val);

    let curr = this.root;
    for (const char of key) {
      if (!curr.children.has(char)) curr.children.set(char, new TrieNode());
      curr = curr.children.get(char)!;
      curr.sum += diff;
    }
  }

  sum(prefix: string): number {
    let curr = this.root;
    for (const char of prefix) {
      if (!curr.children.has(char)) return 0;
      curr = curr.children.get(char)!;
    }
    return curr.sum;
  }
}
```

**Complexity:**
- **Time:**
  - `insert`: **O(K)** where `K` is the length of the string `key`.
  - `sum`: **O(P)** where `P` is the length of the string `prefix`.
- **Space:** **O(N * K)** to store `N` strings of average length `K` as Trie nodes.
