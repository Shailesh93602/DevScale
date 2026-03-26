# Editorial — LFU Cache

### Approach: Two Hash Maps and Doubly Linked Lists
The requirement of $O(1)$ for both `get` and `put` operations means we cannot use data structures like Heaps, which take $O(\log N)$.

We need a way to:
1. Quickly find a key in the cache ($O(1)$ using a Hash Map).
2. Quickly update the frequency of a key ($O(1)$).
3. Quickly find and remove the least frequently used item ($O(1)$).

**Data Structures**
- `keyMap`: `Map<Key, Node>` stores the node for each key.
- `freqMap`: `Map<Frequency, DoublyLinkedList>` stores a doubly linked list of nodes for each frequency level. 
  - Each list maintains nodes in "Least Recently Used" order. The most recently used node (with that frequency) is at the head, and the least recently used is at the tail.
- `minFreq`: An integer representing the smallest frequency currently in the cache.

**Algorithm**
- **get(key)**:
  - Find node in `keyMap`. If not found, return -1.
  - Increment the node's frequency.
  - Remove node from its current frequency list in `freqMap`.
  - Add node to its new frequency list.
  - Update `minFreq` if the old `minFreq` list became empty.
- **put(key, value)**:
  - If the key exists, update its value and call the `updateFreq` logic (same as `get`).
  - If not exists:
    - If cache is at capacity, remove the tail of the list at `freqMap.get(minFreq)`. Remove that key from `keyMap`.
    - Create a new node with frequency 1 and value.
    - Add it to `keyMap` and the list at `freqMap.get(1)`.
    - Reset `minFreq` to 1.

**Complexity**
- Time: $O(1)$ for both operations.
- Space: $O(N)$ where $N$ is the capacity.
