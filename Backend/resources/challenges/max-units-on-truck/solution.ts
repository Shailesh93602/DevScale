function maximumUnits(boxTypes: number[][], truckSize: number): number {
  // Sort boxes by units per box in descending order
  boxTypes.sort((a, b) => b[1] - a[1]);
  
  let totalUnits = 0;
  for (let [count, units] of boxTypes) {
    if (truckSize <= 0) break;
    
    // Take as many boxes as possible of the current type
    const take = Math.min(count, truckSize);
    totalUnits += take * units;
    truckSize -= take;
  }
  
  return totalUnits;
}
