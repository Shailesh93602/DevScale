# Editorial — Assign Cookies

### The Greedy Strategy
This is a classic "Greedy" problem. The objective is to satisfy as many children as possible. 

To maximize the number of satisfied children, we should always try to satisfy the child with the **smallest greed factor** using the **smallest cookie** that is large enough to satisfy them. 

### Why this works?
- If we use a large cookie to satisfy a child with a small greed factor, we might "waste" the large cookie that could have satisfied a different child with a larger greed factor.
- By sorting both greed factors and cookie sizes, we can efficiently iterate through both and make the best decision at each step.

### Algorithm
1. Sort children's greed factors `g`.
2. Sort cookie sizes `s`.
3. Use two pointers: `i` for children and `j` for cookies.
4. If `s[j] >= g[i]`, the child is satisfied. Move to the next child (`i++`).
5. Move to the next cookie (`j++`) in every step, because if a cookie can't satisfy the current child, it certainly won't satisfy any child with a larger greed factor.

### Complexity Analysis
- **Time Complexity**: $O(N \log N + M \log M)$ due to sorting, where $N$ and $M$ are lengths of the arrays.
- **Space Complexity**: $O(\log N + \log M)$ or $O(1)$ depending on the space used by the sorting algorithm.
