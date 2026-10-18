function wordPattern(pattern: string, s: string): boolean {
  const words = s.split(' ');
  if (words.length !== pattern.length) return false;

  const charToWord = new Map<string, string>();
  const wordToChar = new Map<string, string>();

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const word = words[i];

    if (charToWord.has(char)) {
      if (charToWord.get(char) !== word) return false;
    } else {
      if (wordToChar.has(word)) return false;
      charToWord.set(char, word);
      wordToChar.set(word, char);
    }
  }

  return true;
}
