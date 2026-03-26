/**
 * Snowflake ID Generator implementation.
 * Uses BigInt for 64-bit precision in JavaScript/TypeScript.
 */

class SnowflakeIDGenerator {
  private static readonly EPOCH = BigInt(1600000000000); // Custom epoch (e.g., 2020-09-13)
  private static readonly WORKER_BITS = 10n;
  private static readonly SEQUENCE_BITS = 12n;
  
  private static readonly MAX_WORKER_ID = (1n << SnowflakeIDGenerator.WORKER_BITS) - 1n;
  private static readonly MAX_SEQUENCE = (1n << SnowflakeIDGenerator.SEQUENCE_BITS) - 1n;

  private workerId: bigint;
  private lastTimestamp = -1n;
  private sequence = 0n;

  constructor(workerId: number) {
    if (BigInt(workerId) > SnowflakeIDGenerator.MAX_WORKER_ID || workerId < 0) {
      throw new Error(`Worker ID must be between 0 and ${SnowflakeIDGenerator.MAX_WORKER_ID}`);
    }
    this.workerId = BigInt(workerId);
  }

  public nextId(): bigint {
    let timestamp = this.timeGen();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate ID.");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & SnowflakeIDGenerator.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        // Sequence exhausted, wait for next millisecond
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    const id = ((timestamp - SnowflakeIDGenerator.EPOCH) << (SnowflakeIDGenerator.WORKER_BITS + SnowflakeIDGenerator.SEQUENCE_BITS)) |
               (this.workerId << SnowflakeIDGenerator.SEQUENCE_BITS) |
               this.sequence;

    return id;
  }

  private timeGen(): bigint {
    return BigInt(Date.now());
  }

  private tilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen();
    }
    return timestamp;
  }
}

