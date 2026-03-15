# Building H2O

## Problem Description

Simulate water molecule formation. There are two kinds of threads: hydrogen and oxygen. Your goal is to group these threads to form water molecules (H2O). Each molecule needs exactly 2 hydrogen atoms and 1 oxygen atom.

A barrier mechanism must ensure that all three atoms of a molecule are released together before any atom from the next molecule proceeds.

## Function Signature

```typescript
class H2O {
  hydrogen(releaseHydrogen: () => void): Promise<void>;
  oxygen(releaseOxygen: () => void): Promise<void>;
}
```

## Example

```
Input: atoms = "OOHHHH"
Output: molecules = ["HHO", "HHO"]

Explanation: 4 H atoms and 2 O atoms form 2 water molecules.
Each molecule has exactly 2 H and 1 O.
```

## Constraints

- Total H atoms = 2 * total O atoms
- Total atoms is divisible by 3
- Each molecule must contain exactly 2 H and 1 O
