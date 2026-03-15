# Editorial — Design Add and Search Words Data Structure

## Approach: Trie + Depth-First Search (DFS)

This problem builds directly upon the standard **Trie (Prefix Tree)** implementation.

Adding a word behaves exactly like typical Trie insertion. We iterate through each character of the word, creating new Trie nodes as necessary to map out the string path, and flag the final node as `isEndOfWord`.

The challenge comes with searching, because the search string can contain the wildcard `.` (dot) character, which acts like a wildcard that matches ANY single letter.

### Handling the Wildcard `.`
When performing a standard Trie search and we encounter a regular letter, we simply move to the corresponding child node. But when we encounter `.`, we don't know which child node to pick — any of them could lead to a valid word!

Therefore, we must **explore all children simultaneously**. We can achieve this using Depth-First Search (DFS):
- We define a recursive helper `dfs(index, node, word)` that searches the word starting from character `index` within the Trie starting at `node`.
- If `word[index]` is a normal character, we check if `node.children` contains it. If yes, we recurse on `dfs(index + 1, childNode, word)`. If not, we return `false`.
- If `word[index]` is `.`, we iterate over *every* child node present in `node.children`. We recursively call `dfs(index + 1, childNode, word)` on each. If *any* of those calls return `true`, we immediately bubble up `true`! If all potential paths fail, we return `false`.

```typescript
class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
}

class WordDictionary {
  root = new TrieNode();
  // ... addWord implementation standard Trie ...

  search(word: string): boolean {
    return this.dfs(0, this.root, word);
  }

  private dfs(index: number, node: TrieNode, word: string): boolean {
    for (let i = index; i < word.length; i++) {
      const char = word[i];
      if (char === '.') {
        for (const childNode of node.children.values()) {
          if (this.dfs(i + 1, childNode, word)) return true;
        }
        return false;
      } else {
        if (!node.children.has(char)) return false;
        node = node.children.get(char)!;
      }
    }
    return node.isEndOfWord;
  }
}
```

**Complexity:**
- **Time:** `O(M)` for `addWord` where `M` is word length. For `search`, in the worst case (searching for `....`), it visits all nodes in the Trie, which is `O(N)` where `N` is the total number of characters in all words combined.
- **Space:** `O(M)` to insert a word. `O(M)` recursive stack space for `search` since depth is bounded by word length.
