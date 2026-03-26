function titleToNumber(columnTitle: string): number {
  let result = 0;
  for (let i = 0; i < columnTitle.length; i++) {
    const charCode = columnTitle.charCodeAt(i) - 64; // 'A' is 65
    result = result * 26 + charCode;
  }
  return result;
}
