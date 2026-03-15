// Database Transactions & Optimistic Locking - Reference Solution

import * as crypto from 'crypto';

interface VersionedRecord {
  id: string;
  data: any;
  version: number;
  updatedAt: number;
}

interface CommitResult {
  success: boolean;
  conflictKeys?: string[];
  retryCount?: number;
}

// Versioned data store
class VersionedStore {
  private records: Map<string, VersionedRecord> = new Map();

  get(key: string): VersionedRecord | null {
    return this.records.get(key) || null;
  }

  set(key: string, data: any, expectedVersion: number): boolean {
    const current = this.records.get(key);
    const currentVersion = current?.version || 0;

    if (currentVersion !== expectedVersion) {
      return false; // Version conflict
    }

    this.records.set(key, {
      id: key,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      version: currentVersion + 1,
      updatedAt: Date.now(),
    });
    return true;
  }

  // Initialize a record (for setup)
  initialize(key: string, data: any): void {
    this.records.set(key, {
      id: key,
      data: JSON.parse(JSON.stringify(data)),
      version: 1,
      updatedAt: Date.now(),
    });
  }
}

// Transaction class
class Transaction {
  readonly id: string;
  status: 'active' | 'committed' | 'rolled_back' | 'conflict' = 'active';
  readSet: Map<string, number> = new Map();    // key -> version at read time
  writeSet: Map<string, any> = new Map();       // key -> new value
  readonly startTimestamp: number;

  private store: VersionedStore;

  constructor(store: VersionedStore) {
    this.id = crypto.randomUUID();
    this.startTimestamp = Date.now();
    this.store = store;
  }

  // Read a record within the transaction
  async read(key: string): Promise<any> {
    // If we have a pending write for this key, return that
    if (this.writeSet.has(key)) {
      return JSON.parse(JSON.stringify(this.writeSet.get(key)));
    }

    const record = this.store.get(key);
    if (record) {
      this.readSet.set(key, record.version);
      return JSON.parse(JSON.stringify(record.data));
    }

    // Key does not exist yet
    this.readSet.set(key, 0);
    return null;
  }

  // Buffer a write within the transaction
  async write(key: string, data: any): Promise<void> {
    if (this.status !== 'active') {
      throw new Error('Cannot write to a non-active transaction');
    }

    // Ensure we have read the key first (for version tracking)
    if (!this.readSet.has(key)) {
      await this.read(key);
    }

    this.writeSet.set(key, JSON.parse(JSON.stringify(data)));
  }
}

// Transaction Manager
class TransactionManager {
  private store: VersionedStore;
  private commitLock = false; // Simple mutex for serialized commits

  constructor(store?: VersionedStore) {
    this.store = store || new VersionedStore();
  }

  // Begin a new transaction
  begin(): Transaction {
    return new Transaction(this.store);
  }

  // Commit a transaction
  async commit(tx: Transaction): Promise<CommitResult> {
    if (tx.status !== 'active') {
      return { success: false, conflictKeys: [] };
    }

    // Acquire commit lock for serialized validation
    while (this.commitLock) {
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    this.commitLock = true;

    try {
      // Phase 1: Validation - check all read versions
      const conflictKeys: string[] = [];
      for (const [key, readVersion] of tx.readSet) {
        const current = this.store.get(key);
        const currentVersion = current?.version || 0;

        if (currentVersion !== readVersion) {
          conflictKeys.push(key);
        }
      }

      if (conflictKeys.length > 0) {
        tx.status = 'conflict';
        return { success: false, conflictKeys };
      }

      // Phase 2: Apply - write all changes
      for (const [key, data] of tx.writeSet) {
        const readVersion = tx.readSet.get(key) || 0;
        const success = this.store.set(key, data, readVersion);
        if (!success) {
          // This should not happen if validation passed, but handle gracefully
          tx.status = 'conflict';
          return { success: false, conflictKeys: [key] };
        }
      }

      tx.status = 'committed';
      return { success: true };
    } finally {
      this.commitLock = false;
    }
  }

  // Rollback a transaction
  rollback(tx: Transaction): void {
    if (tx.status === 'active') {
      tx.status = 'rolled_back';
      tx.readSet.clear();
      tx.writeSet.clear();
    }
  }

  // Execute a function within a transaction with automatic retry
  async withTransaction<T>(
    fn: (tx: Transaction) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const tx = this.begin();

      try {
        // Check transaction timeout
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Transaction timeout')), 5000)
        );

        const result = await Promise.race([fn(tx), timeout]);
        const commitResult = await this.commit(tx);

        if (commitResult.success) {
          return result;
        }

        // Conflict detected - will retry
        lastError = new Error(
          `Conflict on keys: ${commitResult.conflictKeys?.join(', ')}`
        );
      } catch (error: any) {
        this.rollback(tx);

        // Don't retry on application errors (non-conflict)
        if (error.message !== 'Transaction timeout') {
          throw error;
        }
        lastError = error;
      }
    }

    throw new Error(
      `Transaction failed after ${maxRetries + 1} attempts: ${lastError?.message}`
    );
  }

  // Initialize data (outside transactions, for setup)
  initializeRecord(key: string, data: any): void {
    this.store.initialize(key, data);
  }

  // Read current state (outside transactions, for verification)
  getCurrentState(key: string): any {
    const record = this.store.get(key);
    return record ? { ...record } : null;
  }
}

export { TransactionManager, Transaction, VersionedStore, CommitResult };
