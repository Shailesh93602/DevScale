# Editorial — Longest Word in Dictionary

## Approach 1: Sorting + HashSet (O(N log N * Length) Time)

The primary condition is that the longest word MUST be buildable, one character at a time, entirely from other words in the dictionary. This means for a word to be valid, every prefix of it must also exist in the dictionary as a standalone string.

By **sorting the array lexicographically**, we get a tremendous advantage:
1. Shorter strings naturally appear before longer strings.
2. Ties in length are broken by alphabetical order. Standard sorts guarantee `"apple"` appears before `"apply"`.

We can iterate over the sorted words and check them against a `HashSet`.
- A word of length 1 is always valid. 
- A longer word is only valid if its prefix (the word minus its last character) is already in our `builtWords` set. 
- If valid, add it to the set, and update `longest` if its length exceeds our current `longest` (since the array is sorted alphabetically, the *first* longest valid word we find is guaranteed to be the lexicographically smallest!).

*(Note: While string lengths are small here, technically string sorting takes `O(W log W * L)` where `W` is the number of words, and `L` is maximum word length)*

```typescript
function longestWord(words: string[]): string {
  words.sort();
  const builtWords = new Set<string>();
  let longest = "";

  for (const word of words) {
    if (word.length === 1 || builtWords.has(word.slice(0, -1))) {
      builtWords.add(word);
      if (word.length > longest.length) longest = word;
    }
  }

  return longest;
}
```

## Approach 2: Trie + DFS/BFS (O(N * Length) Time)

While sorting is extremely intuitive, building a **Trie** offers pure `O(Total characters)` complexity without relying on a sorting algorithm.

1. **Insert**: Insert every word into the Trie and flag the ends of words.
2. **Search**: Perform a DFS or BFS from the root. Crucially, *only branch down to children that are explicitly flagged as the end of a word*. Keep track of the longest string path built. 

If there's a tie in length, you can compare strings manually or ensure your Trie array is iterated backwards algebraically to favor lexicographically smaller characters.

**Complexity:**
- **Time:** **O(Total length of all words)** for the sorting method (worst-case string comparison bounding) and the Trie method. 
- **Space:** **O(Total length of all words)** to store the Set or Trie branches.
