# Design a Distributed Cache

Design a distributed, in-memory key-value cache system similar to Redis or Memcached. The system should provide low-latency data access and be scalable across multiple nodes to handle massive amounts of data and high request rates.

## Requirements

### Functional Requirements
1. **Basic Operations**: Support `get`, `set`, and `delete`.
2. **Expirations (TTL)**: Keys should expire and be automatically deleted after a specified duration.
3. **Memory Management**: Support eviction policies like **LRU (Least Recently Used)** or **LFU (Least Frequently Used)** when the allocated memory is full.
4. **Data Partitioning**: Distribute data across multiple nodes to handle more data than a single machine's RAM.

### Non-Functional Requirements
1. **Low Latency**: Performance should be in the sub-millisecond range for memory-bound operations.
2. **Scalability**: Seamless horizontal scaling using algorithms like **Consistent Hashing**.
3. **Availability & Reliability**: Data should be replicated to prevent loss if a single node fails.

## Examples

**Example Scenario**:
- **Operation**: `cache.set("user:101", { name: "John Doe" }, 300)`
- **Operation**: `cache.get("user:101")`
- **Result**: `{ name: "John Doe" }`
- **Wait 301 seconds**: `cache.get("user:101")` returns `null`.

## Constraints
- Finite memory per node (e.g., 64GB).
- High throughput requirement (100k+ operations per second).
- Handle edge cases like **Cache Stampede** and **Hot Keys**.
