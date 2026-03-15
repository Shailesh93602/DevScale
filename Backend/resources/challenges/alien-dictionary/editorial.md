# Editorial — Alien Dictionary

## Approach: Topological Sort using Kahn's Algorithm (O(C) Time, O(1) Space)

Where `C` is the total length of all words combined.

1. **Graph Construction:**
   - Initialize a set of edges `adj` and an `inDegree` map for every unique character.
   - Compare adjacent words in `words`. Find the first character that differs: `w1[j] !== w2[j]`.
   - Add a directed edge from `w1[j]` to `w2[j]` and increment `inDegree[w2[j]]`.
   - **Edge case:** If `w1.length > w2.length` and `w1` starts with `w2` (e.g., "abc" comes before "ab"), the input is invalid, return `""`.

2. **Topological Sort:**
   - Push all characters with `inDegree === 0` into a queue.
   - Pop a character, append it to `result`, and decrement the in-degree of its neighbors.
   - If a neighbor's in-degree reaches `0`, push it to the queue.

3. **Cycle Detection:**
   - If `result.length` does not equal the number of unique characters (`inDegree.size`), it means there's a cycle (conflicting rules). Return `""`.

```typescript
function alienOrder(words: string[]): string {
  const adj = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const word of words)
    for (const char of word) { adj.set(char, new Set()); inDegree.set(char, 0); }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i+1];
    if (w1.length > w2.length && w1.startsWith(w2)) return "";
    for (let j = 0; j < Math.min(w1.length, w2.length); j++) {
      if (w1[j] !== w2[j]) {
        if (!adj.get(w1[j])!.has(w2[j])) {
          adj.get(w1[j])!.add(w2[j]);
          inDegree.set(w2[j], inDegree.get(w2[j])! + 1);
        }
        break; // Only first differing char matters
      }
    }
  }

  const queue = [...inDegree.keys()].filter(c => inDegree.get(c) === 0);
  let result = "";

  while(queue.length) {
    const c = queue.shift();
    result += c;
    for (const nb of adj.get(c)!) {
      inDegree.set(nb, inDegree.get(nb)! - 1);
      if (inDegree.get(nb) === 0) queue.push(nb);
    }
  }

  return result.length === inDegree.size ? result : "";
}
```

**Complexity:**
- **Time:** **O(C)** — `C` is the total number of characters across all words (used for checking adjacent strings and setting up graph degrees). The alphabet is limited to 26 letters, making queue/degree operations constant `O(1)`.
- **Space:** **O(1)** or **O(U + min(U^2, E))**, where `U` is unique characters (at most 26). Thus effectively bounded to `O(1)` or `O(26^2)`.
