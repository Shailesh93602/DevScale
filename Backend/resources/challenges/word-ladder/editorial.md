# Editorial — Word Ladder

## Approach: Breadth-First Search (O(M² × N) Time, O(M² × N) Space)

We need the **shortest** path from `beginWord` to `endWord` — BFS is perfectly suited for doing exactly this in an unweighted graph.

1. Treat each word as a node. Connections are between words that differ by exactly ONE character.
2. Put the `wordList` into a HashSet for O(1) lookups.
3. Use a queue. Add `beginWord`. For each word in the queue, try all possible one-char mutations (for each letter index: replace with 'a' to 'z').
4. If a mutated word is in our dictionary, add it to the next level queue AND remove it from the dictionary so we don't form cycles or revisit words.
5. If we find `endWord`, return the level (res).

```typescript
function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  
  let queue = [beginWord];
  let res = 1;
  
  while (queue.length > 0) {
    const nextQueue = [];
    for (let word of queue) {
      if (word === endWord) return res;
      for (let j = 0; j < word.length; j++) {
        for (let c = 97; c <= 122; c++) {
          const newChar = String.fromCharCode(c);
          if (newChar === word[j]) continue;
          
          const newWord = word.slice(0, j) + newChar + word.slice(j + 1);
          if (wordSet.has(newWord)) {
            nextQueue.push(newWord);
            wordSet.delete(newWord);
          }
        }
      }
    }
    queue = nextQueue;
    res++;
  }
  return 0;
}
```

**Complexity:**
- **Time:** **O(M² × N)** — `M` is the length of each word, `M` to clone word strings when slicing, `N` is the total words. We iterate 26 letters per position per word length.
- **Space:** **O(M² × N)** — for storing the Queue and HashSet.
