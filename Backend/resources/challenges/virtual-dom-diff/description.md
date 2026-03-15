# Virtual DOM Diffing Algorithm

## Problem Description

Implement a virtual DOM diffing algorithm that compares two virtual DOM trees and produces a minimal set of patches (operations) to transform the old tree into the new tree.

This is the core algorithm behind frameworks like React — it determines what changed between renders and produces efficient updates.

## Types

```typescript
interface VNode {
  type: string;
  props: Record<string, any>;
  children: Array<VNode | string>;
}

type Patch =
  | { type: 'CREATE'; node: VNode | string }
  | { type: 'REMOVE' }
  | { type: 'REPLACE'; node: VNode | string }
  | { type: 'UPDATE'; props: PropPatch[]; children: Patch[] }
  ;

interface PropPatch {
  key: string;
  value: any;  // undefined means remove the prop
}
```

## Function Signature

```typescript
function diff(oldNode: VNode | string | null, newNode: VNode | string | null): Patch | null
```

## Rules

1. If old is null and new exists → CREATE
2. If new is null and old exists → REMOVE
3. If types differ (or text differs) → REPLACE
4. If same type → check props and recursively diff children → UPDATE

## Examples

### Example 1 — Text Change
```typescript
diff(
  { type: 'p', props: {}, children: ['Hello'] },
  { type: 'p', props: {}, children: ['World'] }
);
// UPDATE with child REPLACE 'Hello' -> 'World'
```

### Example 2 — Type Change
```typescript
diff(
  { type: 'div', props: {}, children: [] },
  { type: 'span', props: {}, children: [] }
);
// REPLACE entire node
```

### Example 3 — Prop Change
```typescript
diff(
  { type: 'div', props: { class: 'old' }, children: [] },
  { type: 'div', props: { class: 'new' }, children: [] }
);
// UPDATE with props: [{ key: 'class', value: 'new' }]
```

## Constraints

- VNode type is a string (element tag name)
- Props are flat key-value pairs (no nested objects)
- Children are either VNodes or strings (text nodes)
- The diff should be minimal (avoid unnecessary patches)
