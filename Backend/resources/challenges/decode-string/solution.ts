function decodeString(s: string): string {
  const stack: [string, number][] = [];
  let currentString = "";
  let currentNum = 0;
  
  for (let char of s) {
    if (char >= "0" && char <= "9") {
      // Build the multiplier number
      currentNum = currentNum * 10 + parseInt(char);
    } else if (char === "[") {
      // Push the current state to stack and reset
      stack.push([currentString, currentNum]);
      currentString = "";
      currentNum = 0;
    } else if (char === "]") {
      // Pop the previous string and the multiplier
      const [prevString, num] = stack.pop()!;
      currentString = prevString + currentString.repeat(num);
    } else {
      // It's a character, just append
      currentString += char;
    }
  }
  
  return currentString;
}
