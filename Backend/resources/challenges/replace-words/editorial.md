# Editorial — Replace Words

## Approach: Trie (Prefix Tree)

The problem asks us to look at an array of "roots" (the `dictionary`), and a large `sentence`. We must replace every word in the sentence with the shortest matching root from the dictionary. For example, if `"cat"` is a root and the sentence contains `"cattle"`, we should replace it with `"cat"`.

While you could simply iterate over every word in the sentence, and check every single root in the dictionary using String matching `O(word.length * dictionary.size)`, doing so repeatedly for extremely long sentences is inefficient.

A much faster way to check a large number of prefixes simultaneously is a **Trie (Prefix Tree)**!

1. **Build the Trie (`O(Total Characters in Dictionary)`)**: Instead of a simple `isEndOfWord` flag on the final node of a root string, we can store `word` to hold the complete dictionary string itself. This acts as a short-circuit marker, immediately giving us the full root word we matched on.
2. **Process `sentence` (`O(Total Characters in Sentence)`)**: Split the `sentence` into individual strings. For each string: 
   - Start from the `root` of our Trie. Look at the string character by character. 
   - Move from node to node tracking the string. 
   - At every node, check **"is this the end of a valid dictionary root?"**. Since we are traversing from shortest to longest possible paths down the tree, the moment you hit a node where `node.word != null`, you've naturally found the **shortest** valid dictionary root! Break out early and use that root to replace the string.
   - If you ever encounter a character that has no child node, it means NO root in the dictionary can possibly match the current string. Stop searching and preserve the original string.

```typescript
function replaceWords(dictionary: string[], sentence: string): string {
  const root = new TrieNode();
  for (const dictWord of dictionary) {
    let curr = root;
    for (const char of dictWord) {
      if (!curr.children.has(char)) curr.children.set(char, new TrieNode());
      curr = curr.children.get(char)!;
    }
    curr.word = dictWord; // Instead of bool, store string to return quickly
  }

  const result = [];
  for (const word of sentence.split(" ")) {
    let curr = root;
    let found = false;
    for (const char of word) {
      if (curr.word) {
        result.push(curr.word);
        found = true; break;
      }
      if (!curr.children.has(char)) break;
      curr = curr.children.get(char)!;
    }
    if (!found) result.push(curr.word || word);
  }

  return result.join(" ");
}
```

**Complexity:**
- **Time:** `O(N + M)` where `N` is the total character length of all dictionary roots combined, and `M` is the total character length of the sentence. Building the Trie takes `O(N)`. Processing the sentence visits each character at most once, taking `O(M)`.
- **Space:** `O(N + M)` for the Trie nodes `O(N)` and creating the result array `O(M)`.
