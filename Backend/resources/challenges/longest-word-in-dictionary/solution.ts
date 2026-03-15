// O(Total chars in words) Time, O(Total chars in words) Space — Sorting + Set
export function longestWord(words: string[]): string {
  words.sort((a, b) => a.localeCompare(b));
  const builtWords = new Set<string>();
  let longest = "";

  for (const word of words) {
    if (word.length === 1 || builtWords.has(word.slice(0, -1))) {
      builtWords.add(word);
      if (word.length > longest.length) {
        longest = word;
      }
    }
  }

  return longest;
}
