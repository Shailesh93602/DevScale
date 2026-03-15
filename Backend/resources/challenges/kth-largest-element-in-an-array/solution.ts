// O(N) Average Time, O(1) Space — Quickselect
export function findKthLargest(nums: number[], k: number): number {
  const targetIndex = nums.length - k; // Convert to finding (n-k)th smallest

  function partition(left: number, right: number): number {
    const pivot = nums[right];
    let p = left;
    for (let i = left; i < right; i++) {
      if (nums[i] <= pivot) {
        swap(i, p);
        p++;
      }
    }
    swap(p, right);
    return p;
  }

  function swap(i: number, j: number) {
    const temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
  }

  function quickSelect(left: number, right: number): number {
    const p = partition(left, right);

    if (p === targetIndex) {
      return nums[p];
    } else if (p < targetIndex) {
      return quickSelect(p + 1, right);
    } else {
      return quickSelect(left, p - 1);
    }
  }

  return quickSelect(0, nums.length - 1);
}
