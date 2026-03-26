function partition(s: string): string[][] {
  const result: string[][] = [];

  function isPalindrome(str: string): boolean {
    let left = 0, right = str.length - 1;
    while (left < right) {
      if (str[left] !== str[right]) return false;
      left++;
      right--;
    }
    return true;
  }

  function backtrack(startIndex: number, path: string[]) {
    if (startIndex === s.length) {
      result.push([...path]);
      return;
    }

    for (let i = startIndex + 1; i <= s.length; i++) {
      const substring = s.substring(startIndex, i);
      if (isPalindrome(substring)) {
        path.push(substring);
        backtrack(i, path);
        path.pop();
      }
    }
  }

  backtrack(0, []);
  return result;
}
