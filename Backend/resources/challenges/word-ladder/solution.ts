// O(M^2 * N) Time, O(M^2 * N) Space — BFS Shortest Path
function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;

  let queue: string[] = [beginWord];
  let res = 1;

  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (let i = 0; i < queue.length; i++) {
      const word = queue[i];
      if (word === endWord) return res;

      // Try substituting every character in the word
      for (let j = 0; j < word.length; j++) {
        for (let c = 97; c <= 122; c++) {
          const newChar = String.fromCharCode(c);
          if (newChar === word[j]) continue;

          const newWord = word.slice(0, j) + newChar + word.slice(j + 1);

          // If the new valid transformation is found, add to the queue
          if (wordSet.has(newWord)) {
            nextQueue.push(newWord);
            // Critical optimization: remove from set to prevent cycles/duplicates
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
