# Editorial — Valid Anagram

## Approach 1 — Sort (O(n log n))

Sort both strings and compare:

```typescript
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  return s.split('').sort().join('') === t.split('').sort().join('');
}
```

## Approach 2 — Character Frequency Map (Optimal O(n))

Use a 26-slot array (or Map for Unicode) to count characters in `s` and subtract for `t`.

```typescript
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const count = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);

  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - a]++;
    count[t.charCodeAt(i) - a]--;
  }

  return count.every(c => c === 0);
}
```

**Complexity:** Time **O(n)**, Space **O(1)** (fixed 26 slots)
