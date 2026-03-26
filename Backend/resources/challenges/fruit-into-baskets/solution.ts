function totalFruit(fruits: number[]): number {
  let maxCount = 0;
  let left = 0;
  const basket = new Map<number, number>();

  for (let right = 0; right < fruits.length; right++) {
    const fruit = fruits[right];
    basket.set(fruit, (basket.get(fruit) || 0) + 1);

    while (basket.size > 2) {
      const leftFruit = fruits[left];
      basket.set(leftFruit, basket.get(leftFruit)! - 1);
      if (basket.get(leftFruit) === 0) {
        basket.delete(leftFruit);
      }
      left++;
    }

    maxCount = Math.max(maxCount, right - left + 1);
  }

  return maxCount;
}
