# Editorial — Design a Notification System

### The Challenge of Scale and Heterogeneity
A notification system must interface with multiple 3rd-party services, each with its own API, data format, and performance characteristics.

### Key Architectural Patterns
1. **Decoupling with Queues**: Use a Message Queue (like Kafka or RabbitMQ) to store notification requests. This prevents the upstream services from hanging if the notification system is slow or a 3rd-party provider is down.
2. **Channel-Specific Workers**: Each channel (Email, SMS, Push) should have its own set of workers. This allows you to scale the Push workers independently of Email workers.
3. **Template Engine**: Store message templates (e.g., Handlebars, Liquid) separately. The request should only contain the `template_id` and the `data_payload` to minimize network traffic.

### Ensuring Reliability
- **Retry with Exponential Backoff**: When a 3rd-party API returns a transient error (5xx), the worker should re-queue the task with an increasing delay.
- **Dead Letter Queue (DLQ)**: If a message fails after multiple retries, move it to a DLQ for manual inspection.
- **Deduplication**: Use a distributed cache (Redis) to store the IDs of recently processed notifications. If a duplicate ID arrives, drop it.

### The Fan-out Problem
When a major event occurs (e.g., "Elon Musk tweeted"), you need to notify millions of followers immediately. 
- **Pre-computed Lists**: Store the list of followers in a way that allows fast iteration.
- **Batched Requests**: Some providers (like FCM) allow sending a single message to multiple tokens in one API call.

### Complexity Analysis
- **Ingestion Time**: $O(1)$ to push to a queue.
- **Processing Time**: Variable based on 3rd-party latency.
- **Storage**: $O(N)$ for notification logs and history.

