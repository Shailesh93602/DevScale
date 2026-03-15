class ZeroEvenOdd {
  private n: number;
  private state: number = 0;

  constructor(n: number) {
    this.n = n;
  }

  async zero(printZero: () => void): Promise<void> {
    for (let i = 1; i <= this.n; i++) {
      while (this.state !== 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
      printZero();
      this.state = i % 2 === 1 ? 1 : 2;
    }
  }

  async odd(printOdd: (n: number) => void): Promise<void> {
    for (let i = 1; i <= this.n; i += 2) {
      while (this.state !== 1) {
        await new Promise((r) => setTimeout(r, 0));
      }
      printOdd(i);
      this.state = 0;
    }
  }

  async even(printEven: (n: number) => void): Promise<void> {
    for (let i = 2; i <= this.n; i += 2) {
      while (this.state !== 2) {
        await new Promise((r) => setTimeout(r, 0));
      }
      printEven(i);
      this.state = 0;
    }
  }
}

async function printZeroEvenOdd(n: number): Promise<string> {
  let result = "";
  const zeo = new ZeroEvenOdd(n);
  await Promise.all([
    zeo.zero(() => { result += "0"; }),
    zeo.odd((num) => { result += num.toString(); }),
    zeo.even((num) => { result += num.toString(); }),
  ]);
  return result;
}

export { ZeroEvenOdd, printZeroEvenOdd };
