# Editorial — Word Search II

## Approach: Trie + Backtracking (DFS) (O(M × N × 3ᴸ) Time, O(Total Words Length) Space)

A naive DFS for every word on every cell would be extremely slow (`O(W × M × N × 4ᴸ)`). Instead, we can optimize the search by checking for **all words simultaneously** using a **Prefix Tree (Trie)**.

1. **Build the Trie:** Insert all the given words into a Trie. The leaf node of a word should store the actual word (to avoid reconstructing it).
2. **DFS with Backtracking:** Iterate over every cell on the board. Start a DFS from the cell, passing the root of the Trie.
3. **Pruning:** At each step in the DFS, if the current character is not a child in the current Trie node, return immediately.
4. **Found a word:** If the Trie node has a `word` attached, add it to our `result` array. Set `node.word = null` to prevent duplicate additions.
5. **Marking Visited:** To avoid revisiting the same cell in the same word, temporarily set `board[r][c] = '#'` before moving to neighbors, and restore it after.
6. **Optimized Pruning:** After returning from a DFS branch, if the current Trie node has no children left, remove it from its parent. This prevents re-exploring empty branches.

```typescript
// See solution.ts for full implementation
function findWords(board: string[][], words: string[]): string[] {
  // Build Trie
  // ...
  function dfs(r, c, node) {
    // Check bounds & visited
    // Return early if no trie path
    
    // Check if word found
    
    // Visit neighbors (mark '#')
    // Restore character
    // Clean up empty trie nodes
  }
  // Run DFS on all cells
  // ...
}
```

**Complexity:**
- **Time:** **O(M × N × 3ᴸ)** — where `M` and `N` are board dimensions, and `L` is the max length of a word. At each step, we have at most 3 directions (excluding where we came from).
- **Space:** **O(Total Words Length)** — size of the Trie + recursion stack `O(L)`.
