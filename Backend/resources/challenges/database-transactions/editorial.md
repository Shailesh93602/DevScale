# Editorial: Database Transactions & Optimistic Locking

## Approach Overview

Optimistic concurrency control assumes conflicts are rare. Transactions read data freely, and conflicts are detected only at commit time by checking whether the data versions have changed since they were read.

## Key Concepts

### Optimistic vs Pessimistic Locking
- **Optimistic**: No locks during reads. Check versions at commit time. Better for read-heavy workloads.
- **Pessimistic**: Lock data when read. Guarantees no conflicts but reduces concurrency.

### Multi-Version Concurrency Control (MVCC)
Each write creates a new version. Transactions read a consistent snapshot based on their start time.

## Implementation

### Step 1: Data Store with Versioning

```typescript
class VersionedStore {
  private data: Map<string, { value: any; version: number }> = new Map();

  read(key: string): { value: any; version: number } | null {
    return this.data.get(key) || null;
  }

  write(key: string, value: any, expectedVersion: number): boolean {
    const current = this.data.get(key);
    if (current && current.version !== expectedVersion) {
      return false; // Conflict!
    }
    const newVersion = (current?.version || 0) + 1;
    this.data.set(key, { value, version: newVersion });
    return true;
  }
}
```

### Step 2: Transaction Object

```typescript
class Transaction {
  readSet: Map<string, number> = new Map();   // key -> version at read time
  writeSet: Map<string, any> = new Map();      // key -> new value
  status: 'active' | 'committed' | 'rolled_back' | 'conflict' = 'active';

  async read(key: string): Promise<any> {
    const record = store.read(key);
    if (record) {
      this.readSet.set(key, record.version);
      return record.value;
    }
    this.readSet.set(key, 0);
    return null;
  }

  async write(key: string, value: any): Promise<void> {
    this.writeSet.set(key, value);
  }
}
```

### Step 3: Commit with Validation

```typescript
async commit(tx: Transaction): Promise<boolean> {
  // Validate: check all read versions still match
  for (const [key, readVersion] of tx.readSet) {
    const current = this.store.read(key);
    if (current && current.version !== readVersion) {
      tx.status = 'conflict';
      return false;
    }
  }

  // Apply: write all changes atomically
  for (const [key, value] of tx.writeSet) {
    const readVersion = tx.readSet.get(key) || 0;
    this.store.write(key, value, readVersion);
  }

  tx.status = 'committed';
  return true;
}
```

### Step 4: Automatic Retry

```typescript
async withTransaction<T>(
  fn: (tx: Transaction) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const tx = new Transaction();
    try {
      const result = await fn(tx);
      const committed = await this.commit(tx);
      if (committed) return result;
      // Conflict - retry
    } catch (error) {
      this.rollback(tx);
      throw error;
    }
  }
  throw new Error('Transaction failed after max retries');
}
```

## Complexity Analysis

- **Read**: O(1) per key
- **Write (buffered)**: O(1) per key
- **Commit validation**: O(R) where R = size of read set
- **Commit apply**: O(W) where W = size of write set
- **Space**: O(R + W) per transaction + O(N) for the store

## Common Pitfalls

1. **Lost updates**: Without version checking, T2 can overwrite T1's changes
2. **Write skew**: Two transactions read same data, write different keys, both commit successfully but the combined result is inconsistent
3. **Long transactions**: Longer transactions have higher conflict probability
4. **Starvation**: Hot keys cause repeated conflicts for some transactions
5. **Not checking read set**: Only checking write conflicts misses some anomalies
