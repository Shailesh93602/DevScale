# Editorial — Group Anagrams

## Approach 1: Sort each String (O(N * K log K) Time, O(N * K) Space)

We can group anagrams by their "sorted" state.
For example, `"eat"`, `"tea"`, and `"ate"` all sort to `"aet"`. If we use a Hash Map where the key is the sorted form (`"aet"`) and the value is the list of anagrams (`["eat", "tea", "ate"]`), we can do this elegantly.

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const s of strs) {
    // Sort string to create the key
    const sortedStr = s.split('').sort().join('');
    
    if (!map.has(sortedStr)) {
      map.set(sortedStr, []);
    }
    map.get(sortedStr)!.push(s);
  }

  return Array.from(map.values());
}
```

**Complexity:**
- Time: **O(N * K log K)** where N is the number of strings and K is the maximum length of a string. This is because sorting a string of length K takes K log K time.
- Space: **O(N * K)** for our Hash Map.

---

## Approach 2: Array of Character Frequencies (O(N * K) Time, O(N * K) Space)

We can avoid sorting by realizing that two strings are anagrams if their character counts are identical.
Instead of a sorted string as the Map key, we can build a string from the character counts.
For example, a string `"aab"` has 2 'a's, 1 'b', and 0 of everything else. Our array of 26 zeros becomes `[2, 1, 0, 0, ...]`. We can `.join('#')` this array to create our key!

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();

  for (const s of strs) {
    const counts = new Array(26).fill(0);
    
    for (let i = 0; i < s.length; i++) {
        counts[s.charCodeAt(i) - 97]++; // 97 is 'a'
    }

    const key = counts.join('#');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(s);
  }

  return Array.from(map.values());
}
```

**Complexity:**
- Time: **O(N * K)** where N is the number of strings and K is the length of the string.
- Space: **O(N * K)** for our Hash Map data structure holding the grouped strings and keys.
