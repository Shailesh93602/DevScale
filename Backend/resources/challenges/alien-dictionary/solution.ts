// O(C) Time, O(1) Space — Topological Sort using Kahn's Algorithm
function alienOrder(words: string[]): string {
  const adj = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const word of words) {
    for (const char of word) {
      if (!adj.has(char)) {
        adj.set(char, new Set());
        inDegree.set(char, 0);
      }
    }
  }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);

    if (w1.length > w2.length && w1.startsWith(w2)) {
      return ""; // Invalid: prefix comes after the word
    }

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        if (!adj.get(w1[j])!.has(w2[j])) {
          adj.get(w1[j])!.add(w2[j]);
          inDegree.set(w2[j], inDegree.get(w2[j])! + 1);
        }
        break;
      }
    }
  }

  const queue: string[] = [];
  for (const [char, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(char);
  }

  let result = "";
  while (queue.length > 0) {
    const char = queue.shift()!;
    result += char;

    for (const neighbor of adj.get(char)!) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (result.length !== inDegree.size) return ""; // Cycle detected
  return result;
}
