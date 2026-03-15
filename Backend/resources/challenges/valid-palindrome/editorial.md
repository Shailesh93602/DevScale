# Editorial – Valid Palindrome

## Approach 1: Filter and Compare (O(n) Time, O(n) Space)

The problem asks us to ignore non-alphanumeric characters and case. The easiest way to do this is to build a new string that only contains the valid, lowercased characters from the original string. Then, checking if it's a palindrome is just comparing it to its reverse.

```typescript
function isPalindrome(s: string): boolean {
  // Convert everything to lowercase
  const lowerS = s.toLowerCase();
  
  // Keep only alphanumeric characters using Regex
  const cleaned = lowerS.replace(/[^a-z0-9]/g, '');
  
  // Compare with its reversed version
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}
```

**Complexity:**
- Time: **O(n)** — We iterate through the string a few times mapping, replacing, and reversing... but it equates to O(c * n) which simplifies to O(n).
- Space: **O(n)** — We allocate memory for the cleaned string and the reversed array/string.

---

## Approach 2: Two Pointers (Optimal: O(n) Time, O(1) Space)

We can avoid allocating extra space for a new string entirely. Instead, we place a pointer at the beginning (`left = 0`) and end (`right = s.length - 1`).

We move these pointers inward until they meet in the middle. At each step:
1. If the character at `left` isn't alphanumeric, move `left` forward.
2. If the character at `right` isn't alphanumeric, move `right` backward.
3. Once both pointers are on alphanumeric characters, compare their lowercased values. If they differ, return `false`.

```typescript
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  
  // Helper to check if alphanumeric
  const isAlphaNumeric = (c: string) => {
    return /^[a-zA-Z0-9]+$/.test(c);
  };

  while (left < right) {
    if (!isAlphaNumeric(s[left])) {
      left++;
    } else if (!isAlphaNumeric(s[right])) {
      right--;
    } else {
      if (s[left].toLowerCase() !== s[right].toLowerCase()) {
        return false;
      }
      left++;
      right--;
    }
  }

  return true;
}
```

**Complexity:**
- Time: **O(n)** — Both pointers independently travel across the string, touching each character at most once.
- Space: **O(1)** — Only tracking pointer positions, no new arrays/strings created.
