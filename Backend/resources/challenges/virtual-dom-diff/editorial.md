# Editorial — Virtual DOM Diffing Algorithm

## Approach: Recursive Tree Comparison

### Intuition
Compare nodes top-down. If the node type changed, replace entirely. If the same type, diff the props and recursively diff each child. Handle text nodes as a special case.

### Implementation

```typescript
interface VNode {
  type: string;
  props: Record<string, any>;
  children: Array<VNode | string>;
}

interface PropPatch {
  key: string;
  value: any;
}

type Patch =
  | { type: 'CREATE'; node: VNode | string }
  | { type: 'REMOVE' }
  | { type: 'REPLACE'; node: VNode | string }
  | { type: 'UPDATE'; props: PropPatch[]; children: (Patch | null)[] };

function diff(
  oldNode: VNode | string | null,
  newNode: VNode | string | null
): Patch | null {
  // CREATE
  if (oldNode === null || oldNode === undefined) {
    if (newNode === null || newNode === undefined) return null;
    return { type: 'CREATE', node: newNode };
  }

  // REMOVE
  if (newNode === null || newNode === undefined) {
    return { type: 'REMOVE' };
  }

  // Text node comparison
  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    if (oldNode !== newNode) {
      return { type: 'REPLACE', node: newNode };
    }
    return null;
  }

  // Different element types — full replace
  if (oldNode.type !== newNode.type) {
    return { type: 'REPLACE', node: newNode };
  }

  // Same type — diff props and children
  const propPatches = diffProps(oldNode.props, newNode.props);
  const childPatches = diffChildren(oldNode.children, newNode.children);

  // Only produce UPDATE patch if there are actual changes
  if (propPatches.length === 0 && childPatches.every(p => p === null)) {
    return null;
  }

  return { type: 'UPDATE', props: propPatches, children: childPatches };
}

function diffProps(
  oldProps: Record<string, any>,
  newProps: Record<string, any>
): PropPatch[] {
  const patches: PropPatch[] = [];
  const allKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const key of allKeys) {
    if (oldProps[key] !== newProps[key]) {
      patches.push({ key, value: newProps[key] });
    }
  }

  return patches;
}

function diffChildren(
  oldChildren: Array<VNode | string>,
  newChildren: Array<VNode | string>
): (Patch | null)[] {
  const patches: (Patch | null)[] = [];
  const maxLen = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLen; i++) {
    patches.push(diff(
      i < oldChildren.length ? oldChildren[i] : null,
      i < newChildren.length ? newChildren[i] : null
    ));
  }

  return patches;
}
```

### Complexity
- **Time**: O(n) where n is total nodes (comparing same-position children only, like React).
- **Space**: O(n) for the patches array + O(d) recursion stack where d = tree depth.

## Key Concepts

1. **Same-position comparison** — Like React, we compare children at the same index (no cross-matching).
2. **Minimal patches** — Return null when nothing changed.
3. **Recursive structure** — The patch tree mirrors the VNode tree.
4. **Props diffing** — Check all keys from both old and new props.

## Real-World Considerations

- **Keys** — React uses keys to match children across reorders (not implemented here for simplicity).
- **Component types** — Real frameworks handle component vs element nodes differently.
- **Batching** — Real frameworks batch patches for efficient DOM updates.
