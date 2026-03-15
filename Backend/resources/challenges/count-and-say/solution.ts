// Recursive Generation via Iteration
function countAndSay(n: number): string {
  let result = "1";

  for (let i = 2; i <= n; i++) {
    let currentString = "";
    let count = 1;
    
    for (let j = 0; j < result.length; j++) {
      if (result[j] === result[j + 1]) {
        count++;
      } else {
        currentString += count + result[j];
        count = 1;
      }
    }
    
    result = currentString;
  }

  return result;
}
