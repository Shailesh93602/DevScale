# React Native Offline Data Sync

## Problem Description

Build an **offline data synchronization engine** that merges local and remote changes using a last-write-wins strategy. The system should handle:

1. Local changes made while offline
2. Remote changes from other devices
3. Conflicts when both local and remote modified the same item
4. New items created on either side
5. Deleted items

## Function Signature

```typescript
interface SyncItem {
  id: number;
  data: string;
  timestamp: number;
  deleted?: boolean;
}

interface SyncResult {
  merged: SyncItem[];
  conflicts: { id: number; local: SyncItem; remote: SyncItem; winner: "local" | "remote" }[];
  toUpload: SyncItem[];
  toDownload: SyncItem[];
}

function syncData(
  local: SyncItem[],
  remote: SyncItem[],
  lastSync: number
): SyncResult
```

## Example

```
Input:
  local = [{ id: 1, data: "local_v", timestamp: 100 }]
  remote = [{ id: 1, data: "remote_v", timestamp: 90 }]
  lastSync = 80

Output:
  merged = [{ id: 1, data: "local_v", timestamp: 100 }]
  conflicts = [{ id: 1, local: ..., remote: ..., winner: "local" }]
  toUpload = [{ id: 1, data: "local_v", timestamp: 100 }]
  toDownload = []
```

## Constraints

- Last-write-wins: higher timestamp wins conflicts
- Items with `deleted: true` are soft-deleted
- Items not modified since lastSync are unchanged
