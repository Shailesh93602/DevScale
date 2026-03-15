class FooBar {
  private n: number;
  private fooTurn: boolean = true;

  constructor(n: number) {
    this.n = n;
  }

  async foo(printFoo: () => void): Promise<void> {
    for (let i = 0; i < this.n; i++) {
      while (!this.fooTurn) {
        await new Promise((r) => setTimeout(r, 0));
      }
      printFoo();
      this.fooTurn = false;
    }
  }

  async bar(printBar: () => void): Promise<void> {
    for (let i = 0; i < this.n; i++) {
      while (this.fooTurn) {
        await new Promise((r) => setTimeout(r, 0));
      }
      printBar();
      this.fooTurn = true;
    }
  }
}

async function printFooBar(n: number): Promise<string> {
  let result = "";
  const fb = new FooBar(n);
  await Promise.all([
    fb.foo(() => { result += "foo"; }),
    fb.bar(() => { result += "bar"; }),
  ]);
  return result;
}

export { FooBar, printFooBar };
