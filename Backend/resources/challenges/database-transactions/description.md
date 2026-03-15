# Database Transactions & Optimistic Locking

## Problem Description

Implement a transaction manager that supports ACID properties with optimistic concurrency control. The system should handle concurrent transactions, detect conflicts using version numbers, support automatic retries, and ensure data consistency.

## Requirements

### Functional Requirements
1. **Transaction Lifecycle**: Begin, commit, rollback operations
2. **Optimistic Locking**: Use version numbers to detect conflicts at commit time
3. **Conflict Detection**: Detect when two transactions modify the same data
4. **Automatic Retry**: Retry conflicting transactions with a configurable limit
5. **Isolation**: Read snapshot at transaction start time
6. **Rollback**: Undo all changes on failure or conflict

### ACID Properties

- **Atomicity**: All operations in a transaction succeed or all fail
- **Consistency**: Data moves from one valid state to another
- **Isolation**: Concurrent transactions do not interfere
- **Durability**: Committed changes persist (simulated in-memory)

### Data Model

```typescript
interface Record {
  id: string;
  data: any;
  version: number;
  updatedAt: string;
}

interface Transaction {
  id: string;
  status: 'active' | 'committed' | 'rolled_back' | 'conflict';
  readSet: Map<string, number>;      // key -> version read
  writeSet: Map<string, any>;        // key -> new value
  startTimestamp: number;
}
```

## Examples

### Example 1: Successful Transaction
```typescript
const result = await txManager.withTransaction(async (tx) => {
  const account = await tx.read('account:1');
  await tx.write('account:1', { ...account.data, balance: account.data.balance - 100 });
  return { transferred: 100 };
});
// result: { transferred: 100 }
// account:1 balance decreased by 100, version incremented
```

### Example 2: Conflict Detection
```typescript
// T1 and T2 both read account:1 (version 1)
// T1 writes and commits -> version becomes 2
// T2 tries to commit -> CONFLICT (read version 1, current version 2)
// T2 is automatically retried with fresh data
```

### Example 3: Money Transfer (Atomicity)
```typescript
await txManager.withTransaction(async (tx) => {
  const from = await tx.read('account:A');
  const to = await tx.read('account:B');

  if (from.data.balance < 100) throw new Error('Insufficient funds');

  await tx.write('account:A', { ...from.data, balance: from.data.balance - 100 });
  await tx.write('account:B', { ...to.data, balance: to.data.balance + 100 });
});
// Both accounts updated atomically, or neither is updated
```

## Constraints

- Maximum transaction duration: 5 seconds
- Maximum retry count on conflict: 3
- Version numbers are monotonically increasing integers
- Must support concurrent transactions on the same data
- Must guarantee no lost updates
- Must guarantee no dirty reads
- Read-only transactions never conflict
