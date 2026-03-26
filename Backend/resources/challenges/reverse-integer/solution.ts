function reverse(x: number): number {
  const isNegative = x < 0;
  let num = Math.abs(x);
  let reversed = 0;

  const MAX_INT = 2147483647; // 2^31 - 1
  const MIN_INT = -2147483648; // -2^31

  while (num > 0) {
    const digit = num % 10;
    num = Math.floor(num / 10);

    // Check for overflow before multiplying by 10
    if (reversed > MAX_INT / 10 || (reversed === MAX_INT / 10 && digit > 7)) {
      return 0;
    }

    reversed = reversed * 10 + digit;
  }

  const result = isNegative ? -reversed : reversed;
  if (result < MIN_INT || result > MAX_INT) return 0;
  
  return result;
}
