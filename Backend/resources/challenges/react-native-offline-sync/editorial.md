# Editorial — React Native Offline Data Sync

## Approach: Last-Write-Wins Merge

### Algorithm
1. Build maps of local and remote items by ID
2. Find all unique IDs across both sets
3. For each ID, determine if it was modified locally, remotely, or both since lastSync
4. If both modified: conflict - resolve with last-write-wins (higher timestamp)
5. If only one modified: take that version
6. Track items to upload (local wins) and download (remote wins)

### TypeScript Solution

```typescript
function syncData(
  local: SyncItem[],
  remote: SyncItem[],
  lastSync: number
): SyncResult {
  const localMap = new Map(local.map(item => [item.id, item]));
  const remoteMap = new Map(remote.map(item => [item.id, item]));
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

  const merged: SyncItem[] = [];
  const conflicts: any[] = [];
  const toUpload: SyncItem[] = [];
  const toDownload: SyncItem[] = [];

  for (const id of allIds) {
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);

    const localModified = localItem && localItem.timestamp > lastSync;
    const remoteModified = remoteItem && remoteItem.timestamp > lastSync;

    if (localModified && remoteModified) {
      const winner = localItem!.timestamp >= remoteItem!.timestamp ? "local" : "remote";
      const winnerItem = winner === "local" ? localItem! : remoteItem!;
      conflicts.push({ id, local: localItem, remote: remoteItem, winner });
      if (!winnerItem.deleted) merged.push(winnerItem);
      if (winner === "local") toUpload.push(winnerItem);
      else toDownload.push(winnerItem);
    } else if (localModified) {
      if (!localItem!.deleted) merged.push(localItem!);
      toUpload.push(localItem!);
    } else if (remoteModified) {
      if (!remoteItem!.deleted) merged.push(remoteItem!);
      toDownload.push(remoteItem!);
    } else {
      const item = localItem || remoteItem;
      if (item && !item.deleted) merged.push(item);
    }
  }

  return { merged, conflicts, toUpload, toDownload };
}
```

### Complexity
- **Time**: O(n + m) where n=local items, m=remote items
- **Space**: O(n + m) for maps
