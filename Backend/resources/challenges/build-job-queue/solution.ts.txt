// Build a Job Queue System - Reference Solution

import * as crypto from 'crypto';

// Types
interface Job {
  id: string;
  type: string;
  payload: any;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'dead';
  priority: number;
  attempts: number;
  maxRetries: number;
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  nextRetryAt?: number;
  delay?: number;
  backoffType: 'exponential' | 'linear';
  timeout: number;
}

interface JobOptions {
  priority?: number;
  retries?: number;
  delay?: number;
  backoff?: 'exponential' | 'linear';
  timeout?: number;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  dead: number;
  totalProcessed: number;
  avgProcessingTime: number;
}

type JobHandler = (job: Job) => Promise<any>;

// Priority Queue implementation
class PriorityQueue {
  private items: Job[] = [];

  enqueue(job: Job): void {
    // Find insertion point (higher priority first, then FIFO)
    let insertIdx = this.items.length;
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < job.priority) {
        insertIdx = i;
        break;
      }
      if (this.items[i].priority === job.priority && this.items[i].createdAt > job.createdAt) {
        insertIdx = i;
        break;
      }
    }
    this.items.splice(insertIdx, 0, job);
  }

  dequeue(): Job | undefined {
    return this.items.shift();
  }

  peek(): Job | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  remove(jobId: string): boolean {
    const idx = this.items.findIndex(j => j.id === jobId);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}

// Job Queue
class JobQueue {
  private queue = new PriorityQueue();
  private handlers: Map<string, JobHandler> = new Map();
  private jobs: Map<string, Job> = new Map();
  private activeWorkers: Map<string, number> = new Map(); // type -> count
  private maxConcurrency: number;
  private processingTimes: number[] = [];
  private isProcessing = false;
  private delayedJobs: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

  // Add a job to the queue
  async add(type: string, payload: any, options: JobOptions = {}): Promise<Job> {
    // Validate payload size
    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 65536) {
      throw new Error('Job payload exceeds maximum size of 64KB');
    }

    const job: Job = {
      id: crypto.randomUUID(),
      type,
      payload,
      status: options.delay ? 'delayed' : 'waiting',
      priority: options.priority || 0,
      attempts: 0,
      maxRetries: options.retries ?? 3,
      createdAt: Date.now(),
      delay: options.delay,
      backoffType: options.backoff || 'exponential',
      timeout: options.timeout || 30000,
    };

    this.jobs.set(job.id, job);

    if (options.delay) {
      // Schedule delayed job
      const timer = setTimeout(() => {
        job.status = 'waiting';
        this.queue.enqueue(job);
        this.delayedJobs.delete(job.id);
        this.processNext();
      }, options.delay);
      this.delayedJobs.set(job.id, timer);
    } else {
      this.queue.enqueue(job);
      this.processNext();
    }

    return { ...job };
  }

  // Register a handler for a job type
  process(type: string, handler: JobHandler): void {
    this.handlers.set(type, handler);
    if (!this.activeWorkers.has(type)) {
      this.activeWorkers.set(type, 0);
    }
    // Start processing any waiting jobs of this type
    this.processNext();
  }

  // Get a job by ID
  async getJob(id: string): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    return job ? { ...job } : undefined;
  }

  // Get queue statistics
  getStats(): QueueStats {
    let waiting = 0, active = 0, completed = 0, failed = 0, delayed = 0, dead = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'waiting': waiting++; break;
        case 'active': active++; break;
        case 'completed': completed++; break;
        case 'failed': failed++; break;
        case 'delayed': delayed++; break;
        case 'dead': dead++; break;
      }
    }

    const avgTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      : 0;

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      dead,
      totalProcessed: completed + dead,
      avgProcessingTime: Math.round(avgTime),
    };
  }

  // Process the next available job
  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.size > 0) {
        const job = this.queue.peek();
        if (!job) break;

        const handler = this.handlers.get(job.type);
        if (!handler) break;

        const activeCount = this.activeWorkers.get(job.type) || 0;
        if (activeCount >= this.maxConcurrency) break;

        // Dequeue and process
        this.queue.dequeue();
        this.activeWorkers.set(job.type, activeCount + 1);

        // Process asynchronously (don't await to allow concurrency)
        this.executeJob(job, handler);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Execute a single job
  private async executeJob(job: Job, handler: JobHandler): Promise<void> {
    job.status = 'active';
    job.startedAt = Date.now();
    job.attempts++;

    try {
      // Race between handler and timeout
      const result = await Promise.race([
        handler(job),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Job timeout exceeded')), job.timeout)
        ),
      ]);

      job.status = 'completed';
      job.result = result;
      job.completedAt = Date.now();
      this.processingTimes.push(job.completedAt - job.startedAt!);
    } catch (error: any) {
      job.error = error.message;

      if (job.attempts < job.maxRetries) {
        // Schedule retry
        job.status = 'failed';
        const backoffMs = this.calculateBackoff(job.attempts, job.backoffType);
        job.nextRetryAt = Date.now() + backoffMs;

        setTimeout(() => {
          job.status = 'waiting';
          this.queue.enqueue(job);
          this.processNext();
        }, backoffMs);
      } else {
        // Max retries exceeded
        job.status = 'dead';
        job.completedAt = Date.now();
      }
    } finally {
      const activeCount = this.activeWorkers.get(job.type) || 1;
      this.activeWorkers.set(job.type, activeCount - 1);
      this.processNext();
    }
  }

  // Calculate backoff delay
  private calculateBackoff(attempt: number, type: 'exponential' | 'linear'): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 60000; // 60 seconds

    if (type === 'exponential') {
      return Math.min(Math.pow(2, attempt - 1) * baseDelay, maxDelay);
    }
    return Math.min(attempt * baseDelay, maxDelay);
  }

  // Cancel a job
  async cancel(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'waiting') {
      this.queue.remove(jobId);
      job.status = 'dead';
      return true;
    }

    if (job.status === 'delayed') {
      const timer = this.delayedJobs.get(jobId);
      if (timer) clearTimeout(timer);
      this.delayedJobs.delete(jobId);
      job.status = 'dead';
      return true;
    }

    return false; // Cannot cancel active jobs
  }
}

export { JobQueue, Job, JobOptions, QueueStats };
