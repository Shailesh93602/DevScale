# Editorial — Word Pattern

### Approach: Bijective Mapping using Two Hash Maps
To solve this problem, we need to ensure that:
1. Every character in `pattern` maps to exactly one word in `s`.
2. Every word in `s` maps to exactly one character in `pattern`.
3. No two characters map to the same word.
4. No two words map to the same character.

This is a classic bijective mapping problem.

**Algorithm**
1. Split string `s` into an array of words `words`.
2. If `pattern.length !== words.length`, return `false`.
3. Create two maps: `charToWord` and `wordToChar`.
4. Iterate through `pattern` and `words`:
   - If current character is in `charToWord` but maps to a different word, return `false`.
   - If current word is in `wordToChar` but maps to a different character, return `false`.
   - Otherwise, add the mappings to both maps.
5. If the loop finishes, return `true`.

**Complexity**
- Time: $O(N + M)$ where $N$ is the number of characters in the pattern and $M$ is the number of characters in the string $s$ (for splitting and iterating).
- Space: $O(W)$ where $W$ is the number of unique words/characters.
