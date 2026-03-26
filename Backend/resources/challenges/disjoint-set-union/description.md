# Disjoint Set Union (Union-Find)

Implement a **Disjoint Set Union (DSU)** data structure, also known as **Union-Find**.

The DSU should support the following operations efficiently:
1. `find(i)`: Determine which set an element `i` belongs to. Return the "representative" or "root" of that set. Implement **path compression** to optimize future queries.
2. `union(i, j)`: Join two subsets into a single subset. Implement **union by rank** (or height/size) to keep the tree flat.

### Task:
Implement a class `DSU` that initializes with `n` elements (from `0` to `n-1`) and has the methods `find(i)` and `union(i, j)`.

### Example:
```javascript
const dsu = new DSU(5);
dsu.union(0, 1);
dsu.union(1, 2);
console.log(dsu.find(0) === dsu.find(2)); // true
console.log(dsu.find(0) === dsu.find(3)); // false
dsu.union(2, 4);
console.log(dsu.find(4) === dsu.find(0)); // true
```

### Constraints:
- `1 <= n <= 10^5`
- `0 <= i, j < n`
- Up to `10^5` operations.
