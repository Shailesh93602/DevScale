class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

export class WordDictionary {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  addWord(word: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  search(word: string): boolean {
    return this.dfs(0, this.root, word);
  }

  private dfs(index: number, node: TrieNode, word: string): boolean {
    for (let i = index; i < word.length; i++) {
      const char = word[i];

      if (char === '.') {
        for (const childNode of node.children.values()) {
          if (this.dfs(i + 1, childNode, word)) {
            return true;
          }
        }
        return false;
      } else {
        if (!node.children.has(char)) {
          return false;
        }
        node = node.children.get(char)!;
      }
    }

    return node.isEndOfWord;
  }
}
