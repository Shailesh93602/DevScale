# Editorial — Reorganize String

## Approach: Max-Heap with Delay (O(N log A) Time, O(A) Space)

We want to reorganize string characters so that no two adjacent ones are the same. A greedy strategy works perfectly: always place the most frequent remaining character. Why? Because the most frequent character is the hardest to place without conflicts.

We use a **Max-Heap** ordered by character frequency.
1. **Count Frequencies:** Count all character frequencies in `O(N)` time. Add them to a Max-Heap.
2. **Greedy Placement:** While the heap is not empty, extract the character `curr` with the highest frequency and append it to our result string.
3. **Delaying Re-insertion:** After placing `curr`, we can't immediately put it back in the heap because if it is still the most frequent character, we might pull it out next and inadvertently place it adjacent to itself.
   - We must "delay" inserting `curr` back into the heap until the next iteration.
   - We temporarily store it in a `prev` variable. At the start of the next iteration, if `prev` has a count `> 0`, we push it back into the heap.
4. **Validation:** If the heap becomes empty while we still have characters in `prev` with a count `> 0`, it means we are forced to place the same character twice. The reorganization is impossible, so return `""`.

```typescript
function reorganizeString(s: string): string {
  const counts = new Map<string, number>();
  for (const char of s) counts.set(char, (counts.get(char) || 0) + 1);

  const heap = new CharMaxHeap(); // MaxHeap of {char, count}
  for (const [char, count] of counts.entries()) heap.push(char, count);

  let result = '';
  let prev = null;

  while (heap.size() > 0) {
    const current = heap.pop();
    result += current.char;

    // Put prev back into heap now that current is placed
    if (prev && prev.count > 0) heap.push(prev.char, prev.count);

    current.count--;
    prev = current;
  }

  // If result length doesn't match original string, meaning loop ended early because heap was empty
  // but prev still had counts left, we failed.
  return result.length === s.length ? result : '';
}
```

**Complexity:**
- **Time:** **O(N log A)** where `N` is string length and `A` is the alphabet size (26 for lowercase letters). `O(log A)` is practically `O(1)`.
- **Space:** **O(A)** to store the alphabet in the Map and Heap.
