# Editorial — Design a Distributed ID Generator (Snowflake)

### Why 64-bit?
Most database systems (indexing engines) and programming languages handle 64-bit integers natively. They are smaller and faster than 128-bit UUIDs, leading to better database index performance.

### The Snowflake Breakdown
The 64 bits are typically divided to balance lifespan, scale, and parallelism:

1.  **Timestamp (41 bits)**: Provides milliseconds. With 41 bits, the system can run for roughly 69 years before the bits overflow. Using a "Custom Epoch" (e.g., the day your company launched) maximizes this lifespan.
2.  **Worker ID (10 bits)**: Allows for 1,024 unique generator nodes (servers or processes) to run in parallel without coordinating.
3.  **Sequence (12 bits)**: Allows for 4,096 IDs to be generated per millisecond per node.

### Key Implementation Challenges

#### 1. Clock Skew / Drifts
分布式系统中，服务器的时间并不完全同步。If a server's clock moves backward (due to an NTP adjustment), it might generate a duplicate ID.
-   **Solution**: If the current timestamp is less than the `lastTimestamp`, the generator must throw an error or wait for the clock to catch up.

#### 2. Sequence Exhaustion
If a node receives more than 4,096 requests in a single millisecond, the sequence overflows.
-   **Solution**: The generator loops (waits) until the next millisecond starts, then resets the sequence to 0.

#### 3. Worker ID Assignment
How does a new server node know which `workerId` to use?
-   **Solution**: Use a coordinator like **Zookeeper** or **Etcd** to assign unique IDs to nodes as they join the cluster.

### Complexity Analysis
- **Time Complexity**: $O(1)$ per ID (extremely fast bitwise operations).
- **Space Complexity**: $O(1)$ state.
