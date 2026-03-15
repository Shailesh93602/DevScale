interface SyncItem {
  id: number;
  data: string;
  timestamp: number;
  deleted?: boolean;
}

interface SyncResult {
  merged: SyncItem[];
  conflicts: {
    id: number;
    local: SyncItem;
    remote: SyncItem;
    winner: "local" | "remote";
  }[];
  toUpload: SyncItem[];
  toDownload: SyncItem[];
}

function syncData(
  local: SyncItem[],
  remote: SyncItem[],
  lastSync: number
): SyncResult {
  const localMap = new Map(local.map((item) => [item.id, item]));
  const remoteMap = new Map(remote.map((item) => [item.id, item]));
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

  const merged: SyncItem[] = [];
  const conflicts: SyncResult["conflicts"] = [];
  const toUpload: SyncItem[] = [];
  const toDownload: SyncItem[] = [];

  for (const id of allIds) {
    const localItem = localMap.get(id);
    const remoteItem = remoteMap.get(id);

    const localModified = localItem && localItem.timestamp > lastSync;
    const remoteModified = remoteItem && remoteItem.timestamp > lastSync;

    if (localModified && remoteModified) {
      const winner =
        localItem!.timestamp >= remoteItem!.timestamp ? "local" : "remote";
      const winnerItem = winner === "local" ? localItem! : remoteItem!;
      conflicts.push({
        id,
        local: localItem!,
        remote: remoteItem!,
        winner,
      });
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

export { syncData, SyncItem, SyncResult };
