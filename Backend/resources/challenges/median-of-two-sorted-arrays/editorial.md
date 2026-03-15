# Editorial — Median of Two Sorted Arrays

## Problem Summary

Find the median of two sorted arrays in O(log(m+n)) time.

---

## Approach 1 — Merge and Find (O(m+n) time, O(m+n) space)

Merge both arrays and pick the middle element(s).

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  const merged: number[] = [];
  let i = 0, j = 0;
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) merged.push(nums1[i++]);
    else merged.push(nums2[j++]);
  }
  while (i < nums1.length) merged.push(nums1[i++]);
  while (j < nums2.length) merged.push(nums2[j++]);

  const n = merged.length;
  if (n % 2 === 1) return merged[Math.floor(n / 2)];
  return (merged[Math.floor(n / 2) - 1] + merged[Math.floor(n / 2)]) / 2;
}
```

**Complexity:** O(m+n) time, O(m+n) space. Does not meet the O(log) requirement.

---

## Approach 2 — Binary Search on Partition (O(log(min(m,n))) time, O(1) space) ✅ Optimal

Binary search on the shorter array to find the correct partition point. The partition divides both arrays such that all left elements <= all right elements.

```typescript
function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1);
  }

  const m = nums1.length;
  const n = nums2.length;
  let left = 0;
  let right = m;

  while (left <= right) {
    const partitionA = Math.floor((left + right) / 2);
    const partitionB = Math.floor((m + n + 1) / 2) - partitionA;

    const maxLeftA = partitionA === 0 ? -Infinity : nums1[partitionA - 1];
    const minRightA = partitionA === m ? Infinity : nums1[partitionA];
    const maxLeftB = partitionB === 0 ? -Infinity : nums2[partitionB - 1];
    const minRightB = partitionB === n ? Infinity : nums2[partitionB];

    if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
      if ((m + n) % 2 === 1) {
        return Math.max(maxLeftA, maxLeftB);
      }
      return (Math.max(maxLeftA, maxLeftB) + Math.min(minRightA, minRightB)) / 2;
    } else if (maxLeftA > minRightB) {
      right = partitionA - 1;
    } else {
      left = partitionA + 1;
    }
  }

  return 0;
}
```

**Complexity:**
- Time: **O(log(min(m,n)))** — binary search on the shorter array.
- Space: **O(1)**.

---

## Key Insight

The median partitions the combined sorted array into two equal halves. By binary-searching for the correct partition point in the shorter array, we can determine the partition in the longer array (since the total left half size is fixed). We just need to verify the partition is valid: max of left side <= min of right side.
