/**
 * Conceptual Notification System Architecture.
 * Focuses on decoupling, prioritization, and provider abstraction.
 */

enum Priority {
  HIGH = "HIGH",
  NORMAL = "NORMAL",
  LOW = "LOW"
}

interface NotificationTask {
  id: string;
  userId: string;
  templateId: string;
  data: any;
  priority: Priority;
  channels: string[];
}

class NotificationService {
  private queue: NotificationTask[] = [];

  // 1. Ingestion
  public send(userId: string, templateId: string, data: any, priority: Priority = Priority.NORMAL) {
    const task: NotificationTask = {
      id: `task-${Date.now()}`,
      userId,
      templateId,
      data,
      priority,
      channels: this.getUserPreferences(userId)
    };
    
    // Add to internal queue (In production, this would be Kafka/SQS)
    this.queue.push(task);
    this.queue.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
    
    return task.id;
  }

  // 2. Processing (Abstracted)
  public async processNext() {
    const task = this.queue.shift();
    if (!task) return;

    for (const channel of task.channels) {
      try {
        await this.dispatch(channel, task);
      } catch (err) {
        console.error(`Failed to send via ${channel}:`, err);
        this.retry(task, channel);
      }
    }
  }

  private async dispatch(channel: string, task: NotificationTask) {
    // Interface with 3rd party providers (FCM, SES, Twilio)
    console.log(`Dispatching ${task.id} to user ${task.userId} via ${channel}`);
  }

  private retry(task: NotificationTask, channel: string) {
    // Implementation of exponential backoff or DLQ
  }

  private getUserPreferences(userId: string): string[] {
    // Fetch from Redis/DB
    return ["PUSH", "EMAIL"];
  }

  private getPriorityScore(p: Priority): number {
    if (p === Priority.HIGH) return 10;
    if (p === Priority.NORMAL) return 5;
    return 1;
  }
}
