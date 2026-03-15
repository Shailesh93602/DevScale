function encode(strs: string[]): string {
  let encoded = "";
  for (const str of strs) {
    encoded += str.length + "#" + str;
  }
  return encoded;
}

function decode(s: string): string[] {
  const decoded: string[] = [];
  let i = 0;
  
  while (i < s.length) {
    let j = i;
    while (s[j] !== '#') {
      j++;
    }
    
    const length = parseInt(s.substring(i, j), 10);
    const str = s.substring(j + 1, j + 1 + length);
    decoded.push(str);
    
    i = j + 1 + length;
  }
  
  return decoded;
}

export { encode, decode };
