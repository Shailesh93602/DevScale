# Build a Job Queue System

## Problem Description

Build a job queue system that supports background processing of tasks. The system should handle job creation, priority-based processing, retries with exponential backoff, delayed scheduling, concurrency control, and status tracking.

## Requirements

### Functional Requirements
1. **Job Creation**: Add jobs with type, payload, priority, and options
2. **Job Processing**: Register handlers and process jobs by type
3. **Priority Queue**: Process high-priority jobs before low-priority ones
4. **Retry Logic**: Retry failed jobs with configurable exponential backoff
5. **Delayed Jobs**: Schedule jobs to run at a future time
6. **Concurrency**: Control how many jobs run in parallel
7. **Status Tracking**: Track job lifecycle (waiting, active, completed, failed, delayed)

### Job Lifecycle

```
WAITING -> ACTIVE -> COMPLETED
                  -> FAILED -> WAITING (retry)
                            -> DEAD (max retries exceeded)
DELAYED -> WAITING (when delay expires)
```

### Data Models

```typescript
interface Job {
  id: string;
  type: string;
  payload: any;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'dead';
  priority: number;        // Higher = more urgent
  attempts: number;
  maxRetries: number;
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  nextRetryAt?: string;
  delay?: number;          // ms to wait before processing
}

interface JobOptions {
  priority?: number;       // Default: 0
  retries?: number;        // Default: 3
  delay?: number;          // ms
  backoff?: 'exponential' | 'linear';
  timeout?: number;        // ms
}
```

## Examples

### Example 1: Add and Process a Job
```typescript
queue.process('send-email', async (job) => {
  await sendEmail(job.payload.to, job.payload.subject, job.payload.body);
  return { sent: true };
});

const job = await queue.add('send-email', {
  to: 'user@test.com',
  subject: 'Welcome',
  body: 'Hello!'
}, { priority: 10, retries: 3 });

// Job processes and completes
// job.status === 'completed'
// job.result === { sent: true }
```

### Example 2: Failed Job with Retry
```typescript
// Handler that fails
queue.process('flaky-task', async (job) => {
  if (Math.random() < 0.5) throw new Error('Temporary failure');
  return { success: true };
});

const job = await queue.add('flaky-task', {}, { retries: 3, backoff: 'exponential' });
// Attempt 1: fails, retry after 1s
// Attempt 2: fails, retry after 2s
// Attempt 3: fails, retry after 4s
// Attempt 4: succeeds or moves to 'dead' status
```

### Example 3: Delayed Job
```typescript
const job = await queue.add('send-reminder', {
  userId: '123',
  message: 'Your trial expires tomorrow'
}, { delay: 86400000 }); // 24 hours from now

// job.status === 'delayed'
// After 24 hours: job.status transitions to 'waiting' -> 'active' -> 'completed'
```

## Constraints

- Maximum job payload size: 64KB
- Maximum concurrent workers per type: 10
- Default retry count: 3 with exponential backoff
- Job timeout: 30 seconds (configurable)
- Must process higher priority jobs first
- Must handle worker crashes gracefully (requeue active jobs)
- Queue must survive restart (jobs persisted in memory store)
