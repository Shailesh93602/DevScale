function findContentChildren(g: number[], s: number[]): number {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  
  let i = 0; // child index
  let j = 0; // cookie index
  
  while (i < g.length && j < s.length) {
    if (s[j] >= g[i]) {
      i++; // Child is content, move to next child
    }
    j++; // Move to next larger cookie regardless
  }
  
  return i;
}
