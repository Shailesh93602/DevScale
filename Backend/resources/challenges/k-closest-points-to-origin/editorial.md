# Editorial — K Closest Points to Origin

## Approach: Sorting (O(N log N) Time, O(1) Space)

The simplest and most direct way to solve this is to sort the points by their distance from the origin.
Then pick the first `k` elements using `Array.slice(0, k)`.

The Euclidean distance between `(x, y)` and `(0, 0)` is `√(x^2 + y^2)`. Since we're only comparing distances, we don't actually need to compute the square root. We just sort by `x^2 + y^2`.

```typescript
function kClosest(points: number[][], k: number): number[][] {
  const getDistance = (point: number[]) => point[0] * point[0] + point[1] * point[1];

  points.sort((a, b) => getDistance(a) - getDistance(b));

  return points.slice(0, k);
}
```

### Alternative Approach: Max-Heap (O(N log K) Time, O(K) Space)
Instead of sorting all `N` points, especially when `N` is huge but `K` is small, a Min-Heap of size `K` is highly effective. As you iterate through the points, push them into a Max-Heap. Once the heap exceeds size `K`, you pop the maximum (the furthest point). This leaves you with exactly the `K` closest points. Because `K < N`, pushing/popping taking `O(log K)` shrinks the total time down significantly.

### Alternative Approach: Quickselect (O(N) Time, O(1) Space)
For ultimate performance, we can use the Quickselect algorithm. We recursively find a pivot to partition the distances. When the pivot lands precisely on the index `K-1`, all points to the left of `K` must be smaller or equal, meaning they are the `K` closest ones. This method yields **O(N)** average-case linear time complexity.

**Complexity:**
- **Time/Space:** **O(N log N)** native sort. O(1) auxiliary space (depending on language sorting implementation).
