function countPrimes(n: number): number {
  if (n <= 2) return 0;

  const isPrime = new Uint8Array(n).fill(1);
  isPrime[0] = isPrime[1] = 0;

  for (let i = 2; i * i < n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j < n; j += i) {
        isPrime[j] = 0;
      }
    }
  }

  let count = 0;
  for (let i = 2; i < n; i++) {
    if (isPrime[i]) count++;
  }

  return count;
}
