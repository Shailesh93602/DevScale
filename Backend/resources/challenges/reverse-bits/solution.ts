function reverseBits(n: number): number {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    // Left shift result to make room for the next bit
    result = (result << 1) | (n & 1);
    // Right shift n to get the next bit in the next iteration
    n >>>= 1;
  }
  // Use >>> 0 to ensure result is treated as an unsigned 32-bit integer in JS
  return result >>> 0;
}
