function mySqrt(x: number): number {
  if (x < 2) return x;

  let left = 2;
  let right = Math.floor(x / 2);
  let ans = 1;

  while (left <= right) {
    let mid = Math.floor(left + (right - left) / 2);
    let square = mid * mid;

    if (square === x) return mid;
    
    if (square < x) {
      ans = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return ans;
}
