# Design a Message Queue

## Problem Description

Design a distributed message queue system like Apache Kafka or RabbitMQ. The system should allow multiple producers to send messages to "topics" and multiple consumers to read from them asynchronously, ensuring durability and high throughput.

## Requirements

### Functional Requirements
1. **Produce/Consume**: Support publishers sending messages and subscribers receiving them.
2. **Persistence**: Messages must be stored on disk to survive server restarts.
3. **Consumer Groups**: Multiple consumers should be able to share the load of processing messages from a single topic.
4. **Exactly-once / At-least-once**: Configurable delivery guarantees.
5. **Ordering**: Maintain order of messages within a "partition".

### Non-Functional Requirements
1. **High Throughput**: Handle millions of messages per second.
2. **High Durability**: Replicate messages across several brokers.
3. **Fault Tolerance**: Leader election and failover for partitions.
4. **Retention**: Ability to replay messages by maintaining them for a specific period (e.g., 7 days).

## API Design

```typescript
class MessageQueue {
  /**
   * Sends a message to a topic.
   */
  produce(topic: string, message: any): void;

  /**
   * Polls for new messages in a topic for a specific consumer group.
   */
  consume(topic: string, groupId: string): Message[];
}
```

## Examples

**Input**: Producer sends `order_created` event to `orders` topic.
**Result**: Consumer Group A (Billing Service) and Consumer Group B (Inventory Service) both receive and process the message independently.

## Constraints
- Storage scalability to handle many terabytes of message data.
- Coordination service (like Zookeeper/Kraft) for cluster management.
- Latency vs. Throughput trade-offs (batching).
