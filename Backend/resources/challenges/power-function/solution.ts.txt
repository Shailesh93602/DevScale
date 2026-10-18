function myPow(x: number, n: number): number {
  if (n === 0) return 1;
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  const fastPow = (base: number, exp: number): number => {
    if (exp === 0) return 1;
    let half = fastPow(base, Math.floor(exp / 2));
    if (exp % 2 === 0) {
      return half * half;
    } else {
      return half * half * base;
    }
  };

  return fastPow(x, n);
}
