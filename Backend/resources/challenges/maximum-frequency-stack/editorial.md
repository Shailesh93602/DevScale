# Editorial — Maximum Frequency Stack

## Problem Summary

Design a stack where pop returns the most frequent element, with ties broken by recency.

---

## Approach — Frequency Map + Group Stacks (O(1) per operation) ✅ Optimal

Maintain:
1. `freq`: a map from value to its current frequency.
2. `groupStack`: a map from frequency to a stack of values at that frequency.
3. `maxFreq`: the current maximum frequency.

```typescript
class FreqStack {
  private freq: Map<number, number> = new Map();
  private groupStack: Map<number, number[]> = new Map();
  private maxFreq: number = 0;

  push(val: number): void {
    const f = (this.freq.get(val) || 0) + 1;
    this.freq.set(val, f);
    this.maxFreq = Math.max(this.maxFreq, f);
    if (!this.groupStack.has(f)) this.groupStack.set(f, []);
    this.groupStack.get(f)!.push(val);
  }

  pop(): number {
    const stack = this.groupStack.get(this.maxFreq)!;
    const val = stack.pop()!;
    this.freq.set(val, this.freq.get(val)! - 1);
    if (stack.length === 0) this.maxFreq--;
    return val;
  }
}
```

**Complexity:**
- Time: **O(1)** per push and pop.
- Space: **O(n)** total.

---

## Key Insight

Group elements by frequency level. Each element at frequency `f` also appears in all groups 1 through `f`. When we pop, we pop from the highest frequency group. The stack ordering within each group gives us the "most recent" tiebreaker for free.
