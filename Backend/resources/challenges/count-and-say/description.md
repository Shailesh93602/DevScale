# Count and Say

The **count-and-say** sequence is a sequence of digit strings defined by the recursive formula:

- `countAndSay(1) = "1"`
- `countAndSay(n)` is the way you would "say" the digit string from `countAndSay(n-1)`, which is then converted into a different digit string.

To determine how you "say" a digit string, split it into the **minimal** number of substrings such that each substring contains exactly **one** unique digit. Then for each substring, say the number of digits, then say the digit. Finally, concatenate every said digit.

For example, the saying and conversion for digit string `"3322251"`:
* Two 3's, three 2's, one 5, and one 1.
* `"23" + "32" + "15" + "11"`
* `"23321511"`

Given a positive integer `n`, return *the* $n^{th}$ *term of the **count-and-say** sequence*.

---

## Examples

**Example 1:**
```text
Input: n = 1
Output: "1"
Explanation: This is the base case.
```

**Example 2:**
```text
Input: n = 4
Output: "1211"
Explanation:
countAndSay(1) = "1"
countAndSay(2) = say "1" = one 1 = "11"
countAndSay(3) = say "11" = two 1's = "21"
countAndSay(4) = say "21" = one 2 + one 1 = "12" + "11" = "1211"
```

---

## Constraints

- `1 <= n <= 30`
