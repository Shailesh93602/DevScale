class TimeMap {
  private map: Map<string, { timestamp: number; value: string }[]> = new Map();

  constructor() {}

  set(key: string, value: string, timestamp: number): void {
    if (!this.map.has(key)) {
      this.map.set(key, []);
    }
    this.map.get(key)!.push({ timestamp, value });
  }

  get(key: string, timestamp: number): string {
    const values = this.map.get(key);
    if (!values) return "";

    let low = 0;
    let high = values.length - 1;
    let result = "";

    while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      if (values[mid].timestamp <= timestamp) {
        result = values[mid].value;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }
}
