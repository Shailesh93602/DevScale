# Design a Distributed Cache

## Problem Description

Design a distributed, in-memory key-value cache system similar to Redis or Memcached. The system should provide low-latency data access and be scalable across multiple nodes to handle massive amounts of data and high request rates.

## Requirements

### Functional Requirements
1. **Get/Set/Delete**: Standard key-value operations.
2. **TTL (Time To Live)**: Keys should expire after a specified duration.
3. **Eviction Policy**: Support LRU (Least Recently Used) or LFU (Least Frequently Used) when memory is full.
4. **Consistency**: Support configurable consistency levels (Strict vs. Eventual).

### Non-Functional Requirements
1. **Low Latency**: Read and write operations should take < 1-2 milliseconds.
2. **Scalability**: Horizontal scaling through consistent hashing to minimize data remapping when adding/removing nodes.
3. **Fault Tolerance**: Replication of data across multiple nodes to prevent data loss on failure.
4. **Availability**: The system must remain available even if some nodes are down.

## API Design

```typescript
class DistributedCache {
  /**
   * Retrieves value for a key.
   */
  get(key: string): any;

  /**
   * Stores a value with optional TTL (seconds).
   */
  set(key: string, value: any, ttl?: number): void;

  /**
   * Explicitly removes a key.
   */
  remove(key: string): void;
}
```

## Examples

**Input**: `cache.set("user:session:1", {id: 1, name: "Alice"}, 3600)`
**Input**: `cache.get("user:session:1")` -> `{id: 1, name: "Alice"}`

## Constraints
- Memory capacity per node is finite (e.g., 64GB).
- Network bandwidth considerations between clients and cache nodes.
- Handle "Thundering Herd" or "Cache Stampede" scenarios.
