function lemonadeChange(bills: number[]): boolean {
  let five = 0;
  let ten = 0;
  
  for (let bill of bills) {
    if (bill === 5) {
      five++;
    } else if (bill === 10) {
      if (five === 0) return false;
      five--;
      ten++;
    } else { // bill === 20
      // Greedy choice: Always try to use a $10 bill first
      if (ten > 0 && five > 0) {
        ten--;
        five--;
      } else if (five >= 3) {
        five -= 3;
      } else {
        return false;
      }
    }
  }
  
  return true;
}
