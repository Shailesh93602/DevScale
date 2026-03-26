function reconstructQueue(people: number[][]): number[][] {
  // Sort people:
  // 1. By height in descending order
  // 2. By k-value in ascending order for the same height
  people.sort((a, b) => {
    if (a[0] !== b[0]) {
      return b[0] - a[0];
    }
    return a[1] - b[1];
  });
  
  const result: number[][] = [];
  
  // Greedy insert: Since we process taller people first, 
  // their relative order among themselves is already correct.
  // Smaller people being inserted at index 'k' will have exactly 'k' taller 
  // people in front of them (since all people already in the result are taller).
  for (const person of people) {
    result.splice(person[1], 0, person);
  }
  
  return result;
}
