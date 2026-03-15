function myMap<T, U>(arr: T[], callback: (value: T, index: number, array: T[]) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr));
  }
  return result;
}

export { myMap };
