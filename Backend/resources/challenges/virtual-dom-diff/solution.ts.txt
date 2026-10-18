/**
 * Virtual DOM Diffing Algorithm
 *
 * Compares two virtual DOM trees and produces minimal patches.
 *
 * Time: O(n) where n = total nodes
 * Space: O(n) for patches + O(d) recursion depth
 */
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
  // Nothing to nothing
  if (oldNode == null && newNode == null) return null;

  // CREATE
  if (oldNode == null) {
    return { type: 'CREATE', node: newNode! };
  }

  // REMOVE
  if (newNode == null) {
    return { type: 'REMOVE' };
  }

  // Text nodes or type mismatch
  if (typeof oldNode === 'string' || typeof newNode === 'string') {
    return oldNode !== newNode ? { type: 'REPLACE', node: newNode } : null;
  }

  // Different element types — full replace
  if (oldNode.type !== newNode.type) {
    return { type: 'REPLACE', node: newNode };
  }

  // Same type — diff props and children
  const propPatches = diffProps(oldNode.props, newNode.props);
  const childPatches = diffChildren(oldNode.children, newNode.children);

  if (propPatches.length === 0 && childPatches.every(p => p === null)) {
    return null; // No changes
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

export { diff, VNode, Patch, PropPatch };
