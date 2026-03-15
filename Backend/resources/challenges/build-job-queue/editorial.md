# Editorial: Build a Job Queue System

## Approach Overview

A job queue decouples task creation from execution, enabling asynchronous processing, load leveling, and retry logic. The key components are: a priority-ordered queue, worker pool, retry scheduler, and job state machine.

## Architecture

```
Producer -> [Priority Queue] -> Worker Pool -> Result Store
                  ^                    |
                  |--- Retry Scheduler <--- Failed Jobs
```

## Implementation

### Step 1: Priority Queue

```typescript
class PriorityQueue<T> {
  private items: { value: T; priority: number }[] = [];

  enqueue(value: T, priority: number): void {
    const item = { value, priority };
    // Insert in sorted position (higher priority first)
    const index = this.items.findIndex(i => i.priority < priority);
    if (index === -1) this.items.push(item);
    else this.items.splice(index, 0, item);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  get size(): number { return this.items.length; }
}
```

### Step 2: Job State Machine

```typescript
function transitionState(job: Job, event: string): void {
  const transitions: Record<string, Record<string, string>> = {
    waiting: { start: 'active' },
    active: { complete: 'completed', fail: 'failed' },
    failed: { retry: 'waiting', dead: 'dead' },
    delayed: { ready: 'waiting' },
  };

  const newState = transitions[job.status]?.[event];
  if (!newState) throw new Error(`Invalid transition: ${job.status} + ${event}`);
  job.status = newState;
}
```

### Step 3: Exponential Backoff

```typescript
function calculateBackoff(attempt: number, type: 'exponential' | 'linear'): number {
  if (type === 'exponential') {
    return Math.min(Math.pow(2, attempt) * 1000, 60000); // Cap at 60s
  }
  return attempt * 1000; // Linear: 1s, 2s, 3s...
}
```

### Step 4: Worker Pool

```typescript
class WorkerPool {
  private activeWorkers = 0;
  private maxConcurrency: number;

  async process(job: Job, handler: Function): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency) {
      return; // Queue is full, wait for next tick
    }

    this.activeWorkers++;
    try {
      const result = await Promise.race([
        handler(job),
        this.createTimeout(job.timeout),
      ]);
      job.result = result;
      job.status = 'completed';
    } catch (error) {
      job.error = error.message;
      job.status = 'failed';
      this.scheduleRetry(job);
    } finally {
      this.activeWorkers--;
    }
  }
}
```

## Complexity Analysis

- **Add job**: O(n) for sorted insert (O(log n) with binary search)
- **Get next job**: O(1) - dequeue from front
- **Retry scheduling**: O(1) per failed job
- **Get job status**: O(1) with Map lookup
- **Space**: O(J) where J = total jobs in system

## Production Considerations

1. **Persistence**: Use Redis or a database instead of in-memory storage
2. **Distributed workers**: Use Redis BRPOPLPUSH for atomic dequeue
3. **Dead letter queue**: Move permanently failed jobs for manual review
4. **Monitoring**: Track queue depth, processing times, failure rates
5. **Graceful shutdown**: Complete active jobs before stopping workers
