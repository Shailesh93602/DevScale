/**
 * Optimal Solution: Find the common prefix of binary representations.
 * Complexity: O(1) time (max 31 shifts), O(1) space.
 */
export function rangeBitwiseAnd(left: number, right: number): number {
  let shiftCount = 0;
  
  // Find the common prefix
  while (left < right) {
    left >>= 1;
    right >>= 1;
    shiftCount++;
  }
  
  // Shift back to the original position
  return left << shiftCount;
}
