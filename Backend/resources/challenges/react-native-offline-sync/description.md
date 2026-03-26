# React Native Offline Data Sync

Implementing "Offline-First" capability is one of the most challenging parts of mobile development. A robust sync engine must handle local changes, remote updates, and resolve conflicts when the same data is modified on both sides.

In this challenge, you will implement a synchronization function `syncData` that reconciles a local state with a remote state based on a `lastSync` timestamp.

### Data Structures

```typescript
interface SyncItem {
  id: number;
  data: string;
  timestamp: number; // Unix timestamp in milliseconds
  deleted?: boolean; // Flag for soft deletions
}

interface SyncResult {
  merged: SyncItem[]; // Final reconciled list of items (excluding deleted ones)
  conflicts: {
    id: number;
    local: SyncItem;
    remote: SyncItem;
    winner: "local" | "remote";
  }[];
  toUpload: SyncItem[]; // Local modifications that need to be sent to server
  toDownload: SyncItem[]; // Remote modifications that need to be saved locally
}
```

### Rules for Sync

1.  **Modified Since Sync**: An item is considered "modified" if its `timestamp` is greater than `lastSync`.
2.  **Unchanged**: If neither local nor remote version was modified since `lastSync`, keep the item as is in `merged`.
3.  **One-Sided Modification**:
    *   If only the **local** item was modified, add it to `merged` (unless deleted) and `toUpload`.
    *   If only the **remote** item was modified, add it to `merged` (unless deleted) and `toDownload`.
4.  **Conflict (Both Modified)**:
    *   If both versions were modified, use **Last-Write-Wins (LWW)**: the version with the **higher** (or equal) `timestamp` wins.
    *   Add the conflict details to the `conflicts` array.
    *   Add the winner to `merged` (unless deleted).
    *   If `local` wins, add it to `toUpload`. If `remote` wins, add it to `toDownload`.

### Example

**Input**:
```json
{
  "local": [{"id": 1, "data": "local_v", "timestamp": 100}],
  "remote": [{"id": 1, "data": "remote_v", "timestamp": 90}],
  "lastSync": 80
}
```

**Output**:
```json
{
  "merged": [{"id": 1, "data": "local_v", "timestamp": 100}],
  "conflicts": [{"id": 1, "local": {...}, "remote": {...}, "winner": "local"}],
  "toUpload": [{"id": 1, "data": "local_v", "timestamp": 100}],
  "toDownload": []
}
```

### Constraints
- `1 <= local.length, remote.length <= 1000`
- Timestamps are positive integers.
- All IDs are unique within their respective lists.
