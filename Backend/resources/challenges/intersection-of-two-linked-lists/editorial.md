# Editorial — Intersection of Two Linked Lists

## Approach 1: Hash Set (O(m + n) Time, O(m) Space)

The easiest approach is to memorize all the nodes in one list.
1. Traverse `headA` and put every node reference (not just the value, but the actual node object) into a Hash Set.
2. Traverse `headB`. For each node, check if it exists in the Hash Set.
3. The first node you find in the Hash Set is the intersection point! If you reach the end of `headB` without finding any, there is no intersection.

**Complexity:**
- Time: $O(m + n)$
- Space: $O(m)$ or $O(n)$ depending on which list you store.

---

## Approach 2: Two Pointers (O(m + n) Time, O(1) Space)

We can solve this in $O(1)$ space using a very clever two-pointer trick.

The reason two pointers starting at `headA` and `headB` don't normally meet at the intersection is because the lists might have different lengths before the intersection point.
For example, if `listA` has 2 nodes before the intersection and `listB` has 3 nodes before the intersection, a pointer starting at `listB` will always be 1 step behind.

**The Trick:**
Let's make them travel the exact same distance!
If pointer `pA` traverses `listA` and then switches to `listB`, it will travel a total distance of `length(A) + length(B)`.
If pointer `pB` traverses `listB` and then switches to `listA`, it will travel a total distance of `length(B) + length(A)`.

Both pointers will travel the exact same total distance. Because they travel at the same speed (1 node per step), they are guaranteed to reach the intersection node at the exact same time during their second pass!

If there is no intersection, they will both reach `null` at the exact same time (after traversing `m + n` nodes), and the loop will terminate, returning `null`.

```typescript
function getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
  if (headA === null || headB === null) return null;

  let pA: ListNode | null = headA;
  let pB: ListNode | null = headB;

  while (pA !== pB) {
    // If pA reaches the end, redirect it to the head of B
    pA = pA === null ? headB : pA.next;
    // If pB reaches the end, redirect it to the head of A
    pB = pB === null ? headA : pB.next;
  }

  // They either meet at the intersection node or both hit null
  return pA;
}
```

**Complexity:**
- **Time Complexity:** **O(m + n)** where $m$ and $n$ are the lengths of the two lists. In the worst case, each pointer traverses both lists.
- **Space Complexity:** **O(1)** memory, as we only use two pointers.
