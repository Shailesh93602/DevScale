# Editorial — Convert Sorted Array to Binary Search Tree

## Key Insight

To build a height-balanced BST from a sorted array, always pick the middle element as the root. This ensures equal (or near-equal) elements on both sides. Recursively apply this to the left and right halves.

---

## Approach 1: Recursive Divide and Conquer (O(N) Time, O(log N) Space)

Pick the middle element as root, recursively build the left subtree from the left half and the right subtree from the right half.

```typescript
function sortedArrayToBST(nums: number[]): TreeNode | null {
  function build(left: number, right: number): TreeNode | null {
    if (left > right) return null;

    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(nums[mid]);

    node.left = build(left, mid - 1);
    node.right = build(mid + 1, right);

    return node;
  }

  return build(0, nums.length - 1);
}
```

**Complexity:**
- **Time:** O(N) — each element is visited once.
- **Space:** O(log N) — recursion depth for a balanced tree.

---

## Approach 2: Iterative with Queue (O(N) Time, O(N) Space)

Use a queue to simulate the recursive process. Store (node, leftIndex, rightIndex) tuples and process them level by level.

```typescript
function sortedArrayToBST(nums: number[]): TreeNode | null {
  if (nums.length === 0) return null;

  const mid = Math.floor((nums.length - 1) / 2);
  const root = new TreeNode(nums[mid]);
  const queue: [TreeNode, number, number][] = [];

  queue.push([root, 0, mid - 1]); // left subtree range
  queue.push([root, mid + 1, nums.length - 1]); // right subtree range

  let isLeft = true;
  while (queue.length > 0) {
    const [parent, left, right] = queue.shift()!;
    if (left > right) { isLeft = !isLeft; continue; }

    const m = Math.floor((left + right) / 2);
    const child = new TreeNode(nums[m]);

    if (isLeft) parent.left = child;
    else parent.right = child;
    isLeft = !isLeft;

    queue.push([child, left, m - 1]);
    queue.push([child, m + 1, right]);
  }

  return root;
}
```

**Complexity:**
- **Time:** O(N).
- **Space:** O(N) — queue stores all pending work.
