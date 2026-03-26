# Design a Distributed ID Generator

In a distributed system, generating unique identifiers (IDs) at scale is a common requirement. These IDs are often used as primary keys in databases.

### The Problem
Traditional auto-incrementing IDs in a single database don't scale globally and create a single point of failure. Your goal is to design a system that can generate **64-bit unique IDs** across multiple servers with the following properties:
1.  **Uniqueness**: No two IDs should be the same.
2.  **Scalability**: Must handle 10,000+ IDs per second per node.
3.  **Sortability**: IDs should be roughly sortable by time (K-ordered).
4.  **High Availability**: The generator should not have a single point of failure.

### Common Approaches
-   **UUIDs**: 128-bit strings. Unique but not sortable and large (bad for DB indexing).
-   **Database Ticket Server**: A dedicated DB for incrementing IDs. Easy but has a single point of failure and high latency.
-   **Snowflake (Twitter)**: A 64-bit ID comprising a timestamp, worker ID, and sequence number.

### Your Task
Implement a `generateID()` function that follows the **Snowflake** pattern.

### Snowflake ID Structure (64 bits):
-   `1 bit`: Reserved (usually 0).
-   `41 bits`: Timestamp (milliseconds since a custom epoch).
-   `10 bits`: Worker/Machine ID (allows for 1,024 nodes).
-   `12 bits`: Sequence number (resets every millisecond).
