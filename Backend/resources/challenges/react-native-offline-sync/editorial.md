# Editorial — React Native Offline Data Sync

### The Challenge of Offline-First
Offline-first applications allow users to keep working without a network connection. When they reconnect, we must "synchronize" the local changes (queued while offline) with the remote changes (made by other users or devices).

### Conflict Resolution: Last-Write-Wins (LWW)
In this challenge, we use one of the simplest but most effective conflict resolution strategies: **Last-Write-Wins**. By assigning a timestamp to every modification, we can decide that whichever change happened later is the "truth".

### Implementation Strategy
1.  **Normalization**: Use hash maps to store `local` and `remote` items by their ID. This allows $O(1)$ lookup for the "other" version of an item.
2.  **ID Iteration**: Iterate through the union of all unique IDs present in either local or remote states.
3.  **Condition Checking**:
    *   **Is local changed?** `local.timestamp > lastSync`
    *   **Is remote changed?** `remote.timestamp > lastSync`
4.  **Action Logic**:
    *   If **both** changed: Pick the one with the higher timestamp. record a conflict.
    *   If **only local** changed: The local change is "fresh", and there's no remote competition. Upload it.
    *   If **only remote** changed: A remote change occurred that we haven't seen. Download it.
    *   If **neither** changed: Use the version we have (either should be the same as they were at `lastSync`).
5.  **Soft Deletion**: We must respect the `deleted` flag. Even if an item wins the conflict, it should only be included in the `merged` result if it hasn't been deleted.

### Complexity Analysis
- **Time Complexity**: $O(N + M)$ where $N$ is the number of local items and $M$ is the number of remote items. We iterate through each item exactly once.
- **Space Complexity**: $O(N + M)$ to store the maps and the result sets.
