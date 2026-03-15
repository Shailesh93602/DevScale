class H2O {
  private hCount = 0;
  private oCount = 0;
  private hQueue: (() => void)[] = [];
  private oQueue: (() => void)[] = [];

  private tryRelease() {
    if (this.hCount >= 2 && this.oCount >= 1) {
      this.hCount -= 2;
      this.oCount -= 1;
      this.hQueue.shift()!();
      this.hQueue.shift()!();
      this.oQueue.shift()!();
    }
  }

  async hydrogen(releaseHydrogen: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.hCount++;
      this.hQueue.push(() => {
        releaseHydrogen();
        resolve();
      });
      this.tryRelease();
    });
  }

  async oxygen(releaseOxygen: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.oCount++;
      this.oQueue.push(() => {
        releaseOxygen();
        resolve();
      });
      this.tryRelease();
    });
  }
}

async function buildH2O(atoms: string): Promise<string[]> {
  const h2o = new H2O();
  let current = "";
  const molecules: string[] = [];

  const promises = [...atoms].map((atom) => {
    if (atom === "H") {
      return h2o.hydrogen(() => {
        current += "H";
        if (current.length === 3) {
          molecules.push(current);
          current = "";
        }
      });
    } else {
      return h2o.oxygen(() => {
        current += "O";
        if (current.length === 3) {
          molecules.push(current);
          current = "";
        }
      });
    }
  });

  await Promise.all(promises);
  return molecules;
}

export { H2O, buildH2O };
