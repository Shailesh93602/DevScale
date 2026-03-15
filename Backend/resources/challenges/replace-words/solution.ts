class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord: boolean = false;
  word: string = "";
}

// O(N) Time, O(N) Space — Trie Solution
// Build a Trie with the roots, then search each word in the sentence
export function replaceWords(dictionary: string[], sentence: string): string {
  const root = new TrieNode();

  // 1. Build Trie
  for (const dictWord of dictionary) {
    let current = root;
    for (const char of dictWord) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isWord = true;
    current.word = dictWord; 
  }

  // 2. Process sentence
  const words = sentence.split(" ");
  const result: string[] = [];

  for (const word of words) {
    let current = root;
    let foundRoot = false;

    for (const char of word) {
      if (current.isWord) {
        // Found the shortest root, early break
        result.push(current.word);
        foundRoot = true;
        break;
      }
      if (!current.children.has(char)) {
        // No matching root found
        break;
      }
      current = current.children.get(char)!;
    }

    if (!foundRoot) {
      // It might be a match that exactly ends at the last char, but mostly just append original word
      if (current.isWord) {
        result.push(current.word);
      } else {
        result.push(word);
      }
    }
  }

  return result.join(" ");
}
