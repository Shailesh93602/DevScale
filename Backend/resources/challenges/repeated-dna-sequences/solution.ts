function findRepeatedDnaSequences(s: string): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (let i = 0; i <= s.length - 10; i++) {
    const sequence = s.substring(i, i + 10);
    if (seen.has(sequence)) {
      repeated.add(sequence);
    } else {
      seen.add(sequence);
    }
  }

  return Array.from(repeated);
}
