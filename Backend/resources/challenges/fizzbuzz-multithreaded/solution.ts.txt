class FizzBuzzMT {
  private n: number;
  private current = 1;

  constructor(n: number) {
    this.n = n;
  }

  async fizz(printFizz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 3 === 0 && this.current % 5 !== 0) {
        printFizz();
        this.current++;
      } else {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  async buzz(printBuzz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 5 === 0 && this.current % 3 !== 0) {
        printBuzz();
        this.current++;
      } else {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  async fizzbuzz(printFizzBuzz: () => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 15 === 0) {
        printFizzBuzz();
        this.current++;
      } else {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }

  async number(printNumber: (n: number) => void): Promise<void> {
    while (this.current <= this.n) {
      if (this.current % 3 !== 0 && this.current % 5 !== 0) {
        printNumber(this.current);
        this.current++;
      } else {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  }
}

async function fizzBuzzMultithreaded(n: number): Promise<string[]> {
  const result: string[] = [];
  const fb = new FizzBuzzMT(n);
  await Promise.all([
    fb.fizz(() => { result.push("fizz"); }),
    fb.buzz(() => { result.push("buzz"); }),
    fb.fizzbuzz(() => { result.push("fizzbuzz"); }),
    fb.number((num) => { result.push(num.toString()); }),
  ]);
  return result;
}

export { FizzBuzzMT, fizzBuzzMultithreaded };
