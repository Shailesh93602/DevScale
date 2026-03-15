# Encode and Decode Strings

Design an algorithm to encode **a list of strings** to **a single string**. The encoded string is then sent over the network and is decoded back to the original list of strings.

Please implement `encode` and `decode` methods.

---

## Examples

**Example 1:**
```text
Input: ["lint","code","love","you"]
Output: ["lint","code","love","you"]
Explanation:
One possible encode method is: "4#lint4#code4#love3#you".
```

**Example 2:**
```text
Input: ["we", "say", ":", "yes"]
Output: ["we", "say", ":", "yes"]
Explanation:
One possible encode method is: "2#we3#say1#:3#yes"
```

---

## Constraints

- `0 <= strs.length <= 200`
- `0 <= strs[i].length <= 200`
- `strs[i]` contains any possible characters out of `256` valid ascii characters.
- Note: There are no dedicated constraints on the intermediate string length.
