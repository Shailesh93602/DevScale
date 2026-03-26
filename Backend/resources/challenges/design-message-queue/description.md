# Design a Message Queue

Design a distributed, durable, and highly scalable message queue system similar to Apache Kafka or RabbitMQ. The system must support asynchronous communication between multiple producers and consumers through a Publish-Subscribe (Pub-Sub) or Point-to-Point model.

## Requirements

### Functional Requirements
1. **Produce Messages**: Producers can send messages to specific named "topics".
2. **Consume Messages**: Consumers can subscribe to one or more topics.
3. **Durability**: Messages must be persisted to disk to handle server crashes without data loss.
4. **Consumer Groups**: Support multiple consumers in a group where each message is delivered to only one member of the group (load balancing).
5. **Replayability**: Consumers should be able to "seek" back in time and re-read messages within a retention period.

### Non-Functional Requirements
1. **Scalability**: The system should scale horizontally by partitioning topics across multiple servers (brokers).
2. **High Throughput**: Capable of handling millions of messages per second.
3. **Ordering**: Maintain strict ordering of messages within a single partition.
4. **Fault Tolerance**: Replicate messages across multiple brokers to ensure availability.

## System Components to Consider

*   **Broker**: The server that stores messages.
*   **Topic**: A category or feed name to which messages are published.
*   **Partition**: A topic is split into partitions for parallelism.
*   **Offset**: A unique identifier for each message within a partition.
*   **ZooKeeper/KRaft**: Metadata and leader election management.

## Examples

**Example Scenario**:
1. Producer P1 sends `{ "type": "order", "id": 123 }` to topic `orders`.
2. The broker appends this message to a partition of the `orders` topic and assigns it an offset.
3. Consumer Group G1 (a billing service) polls `orders` and receives the message.
4. Consumer Group G2 (a notification service) also polls `orders` and receives the same message.

## Constraints
- Retention period: 7 days by default.
- Support for "At-least-once" and "Exactly-once" delivery semantics.
- Batching support for high-throughput writes.

