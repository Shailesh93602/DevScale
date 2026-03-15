class OrderedPrinter {
  private firstDone: Promise<void>;
  private secondDone: Promise<void>;
  private resolveFirst!: () => void;
  private resolveSecond!: () => void;

  constructor() {
    this.firstDone = new Promise((resolve) => {
      this.resolveFirst = resolve;
    });
    this.secondDone = new Promise((resolve) => {
      this.resolveSecond = resolve;
    });
  }

  async first(printFirst: () => void): Promise<void> {
    printFirst();
    this.resolveFirst();
  }

  async second(printSecond: () => void): Promise<void> {
    await this.firstDone;
    printSecond();
    this.resolveSecond();
  }

  async third(printThird: () => void): Promise<void> {
    await this.secondDone;
    printThird();
  }
}

function printInOrder(order: number[]): Promise<string> {
  return new Promise((resolve) => {
    let result = "";
    const printer = new OrderedPrinter();

    const tasks = order.map((num) => {
      if (num === 1) return printer.first(() => { result += "first"; });
      if (num === 2) return printer.second(() => { result += "second"; });
      return printer.third(() => { result += "third"; });
    });

    Promise.all(tasks).then(() => resolve(result));
  });
}

export { OrderedPrinter, printInOrder };
