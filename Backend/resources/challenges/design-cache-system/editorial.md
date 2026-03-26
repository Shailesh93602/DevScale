# Editorial — Design a Distributed Cache

### Scalability: Consistent Hashing
In a distributed system, mapping keys to nodes using `hash(key) % N` is problematic because if `N` changes (node added/removed), almost all keys move. **Consistent Hashing** maps both keys and nodes to a circular range. Adding a node only moves a fraction of the keys.

### Efficiency: LRU with DLL
To achieve $O(1)$ `get` and `set` with LRU eviction:
- Use a **Hash Map** for $O(1)$ key lookup.
- Use a **Doubly Linked List (DLL)** to track usage. Move accessed items to the head. The tail is always the least recently used item.

### Handling Node Failures
- **Replication**: Copy each key to $M$ subsequent nodes in the consistent hashing ring.
- **Gossip Protocol**: Nodes can use gossip to detect failures of peers.

### Advanced Topics
- **Cache Stampede**: Occurs when many clients request a missing key simultaneously, overloading the backend. Solution: **Locking/Promising** (only one client fetches, others wait).
- **Hot Keys**: A single key is requested millions of times per second (e.g., a celebrity's profile). Solution: **Local Caching** on the client or proxy side.

**Complexity**
- Time: $O(1)$ per operation in memory.
- Space: $O(Memory Capacity)$.
