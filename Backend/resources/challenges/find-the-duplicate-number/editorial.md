# Editorial — Find the Duplicate Number

## Approach 1: Hash Set (O(n) Time, O(n) Space)
A hash set is the most straightforward way to solve this. Add every number you see to the set. If the number is already in the set, that's your duplicate.
The problem explicitly states that you must use **constant extra space**, meaning $O(1)$ space. So while a Hash Set works, it violates the constraints.

---

## Approach 2: Floyd's Cycle Detection Algorithm (O(n) Time, O(1) Space)

The problem constraints give us a crucial hint: the numbers are in the range `[1, n]` and there are exactly `n + 1` elements. 
This structure allows us to treat the array as a **Linked List**.
- The index `i` is a node.
- The value `nums[i]` is the pointer to the `next` node.

Because there is a duplicate number, at least two indices will point to the exact same value (the exact same `next` node). When two nodes point to the same next node in a sequence, a **cycle** is created! The duplicate number is exactly the *entrance to this cycle*.

We use Floyd's Tortoise and Hare algorithm to find the entrance to the cycle.

**Phase 1: Find intersection point**
- `slow` pointer moves 1 step at a time (`nums[slow]`).
- `fast` pointer moves 2 steps at a time (`nums[nums[fast]]`).
- Because there is a cycle, they are guaranteed to meet at some point inside the cycle.

**Phase 2: Find the cycle entrance**
- Once they meet, the distance from the beginning of the list to the cycle entrance is exactly equal to the distance from the meeting point to the cycle entrance.
- We reset one pointer to the very beginning (`0`), and keep the other pointer where they met.
- We now move BOTH pointers exactly 1 step at a time.
- The exact node where they collide again is the entrance to the cycle — which is the duplicate number!

```typescript
function findDuplicate(nums: number[]): number {
  let slow = 0;
  let fast = 0;

  // Phase 1: Find the intersection point
  while (true) {
    slow = nums[slow];
    fast = nums[nums[fast]];
    
    if (slow === fast) {
      break;
    }
  }

  // Phase 2: Find the entrance to the cycle
  let start = 0;
  while (start !== slow) {
    start = nums[start];
    slow = nums[slow];
  }

  // start and slow both point to the duplicate number
  return start;
}
```

**Complexity:**
- **Time Complexity:** **O(n)**. The tortoise and hare will meet after traversing the array at most a couple of times.
- **Space Complexity:** **O(1)**. Only two integer pointers are used, perfectly satisfying the constraint.
