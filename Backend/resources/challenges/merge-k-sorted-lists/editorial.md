# Editorial — Merge k Sorted Lists

## Approach 1: Brute Force — Naive Pick-Min (O(N*k) Time)
At each step, pick the node with the smallest value from the heads of all `k` lists and append it to the merged list. This is $O(N \times k)$ time since we scan up to `k` lists for each of the `N` nodes.

---

## Approach 2: Divide and Conquer (O(N log k) Time, O(1) Space)

This is the most elegant solution. We already know how to merge 2 sorted lists efficiently in $O(n + m)$ time. We can extend this!

Instead of merging all `k` lists at once, we use a "tournament" bracket approach:
- Round 1: Pair up all adjacent lists and merge each pair. We now have `k/2` lists.
- Round 2: Pair up all adjacent lists again. We now have `k/4` lists.
- ...continue until only 1 list remains.

Each round does $O(N)$ total work (since every node is processed once). There are $O(\log k)$ rounds in total. So the overall complexity is $O(N \log k)$.

```typescript
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (!lists || lists.length === 0) return null;
  
  // Divide and conquer — reduce to pairs, merge, repeat
  let interval = 1;
  
  while (interval < lists.length) {
    for (let i = 0; i + interval < lists.length; i += interval * 2) {
      lists[i] = mergeTwoLists(lists[i], lists[i + interval]);
    }
    interval *= 2;
  }

  return lists[0];
}

function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;
  
  while (l1 && l2) {
    if (l1.val < l2.val) {
      curr.next = l1;
      l1 = l1.next;
    } else {
      curr.next = l2;
      l2 = l2.next;
    }
    curr = curr.next;
  }
  
  curr.next = l1 || l2;
  return dummy.next;
}
```

**Complexity:**
- **Time Complexity:** **O(N log k)** where `N` is the total number of nodes across all lists and `k` is the number of lists.
- **Space Complexity:** **O(1)** extra memory (excluding the output list).
