class TrieNode {
  children: { [key: string]: TrieNode } = {};
  word: string | null = null;
}

// O(M*N*3^L) Time, O(Length of all words) Space — Prefix Tree + Backtracking
function findWords(board: string[][], words: string[]): string[] {
  const root = new TrieNode();

  for (const word of words) {
    let curr = root;
    for (const char of word) {
      if (!curr.children[char]) curr.children[char] = new TrieNode();
      curr = curr.children[char];
    }
    curr.word = word;
  }

  const rows = board.length;
  const cols = board[0].length;
  const result: string[] = [];

  function dfs(r: number, c: number, node: TrieNode): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const char = board[r][c];

    if (char === '#' || !node.children[char]) return;

    const nextNode = node.children[char];

    if (nextNode.word !== null) {
      result.push(nextNode.word);
      nextNode.word = null; // Prevent duplicates without a Set
    }

    board[r][c] = '#';

    dfs(r + 1, c, nextNode);
    dfs(r - 1, c, nextNode);
    dfs(r, c + 1, nextNode);
    dfs(r, c - 1, nextNode);

    board[r][c] = char;

    // Optimization: If a node has no more children to explore, delete it.
    if (Object.keys(nextNode.children).length === 0) {
      delete node.children[char];
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, root);
    }
  }

  return result;
}
