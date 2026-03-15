# Editorial — Implement Trie (Prefix Tree)

## Approach: Trie Nodes (O(M) Time per operation, O(M) Space)

A **Trie** (Prefix Tree) is an ordered tree-like data structure used to store a dynamic set of strings where the keys are usually strings. It shines when you need to search for words or prefixes efficiently.

### Structure
Each node in a Trie represents a single character. Instead of storing the character itself, it contains an array or a Hash Map of its child nodes, representing the *next* possible characters. It also contains a boolean flag `isEndOfWord` to indicate whether a complete string ends at that specific node.

### Operations

1. **Insert (O(M))**: To insert a word of length `M`, start at the root node. Interate through each character of the word. If the current character doesn't have an edge from the current node to a child node, create a new node. Move to that child. Finally, set `current.isEndOfWord = true` at the last node.
2. **Search (O(M))**: Start at the root and navigate following the characters of the word. If you encounter a missing child node before finishing the word, return `false`. If you reach the end of the word successfully, return `current.isEndOfWord`. Just because you traversed all characters doesn't mean the exact word exists (e.g., searching for "app" when only "apple" was inserted).
3. **Starts With (O(M))**: Exactly the same logic as `Search`, except if you successfully navigate all characters, return `true`. You don't care if `isEndOfWord` is true or false, because finding the prefix path is sufficient.

```typescript
class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string) {
    let curr = this.root;
    for (const char of word) {
      if (!curr.children.has(char)) curr.children.set(char, new TrieNode());
      curr = curr.children.get(char)!;
    }
    curr.isEndOfWord = true;
  }
}
```

**Complexity:**
- **Time:** **O(M)** for inserting, searching, or checking prefixes, where `M` is the length of the specific string you're processing.
- **Space:** **O(M)** for inserting, since in the worst case you create `M` new nodes. O(1) space for searching or checking prefixes.
