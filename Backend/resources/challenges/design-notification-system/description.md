# Design a Notification System

## Problem Description

Design a scalable notification system capable of sending massive numbers of messages to users across multiple channels, including Push notifications, SMS, and Email.

## Requirements

### Functional Requirements
1. **Multi-channel Support**: Deliver through APNS/FCM (Push), Twilio (SMS), and SES/SendGrid (Email).
2. **Prioritization**: Support different priority levels (e.g., Transactional vs. Marketing).
3. **Deduplication**: Prevent sending the same notification multiple times to the same user.
4. **Retry Mechanism**: Automatically retry failed deliveries with exponential backoff.
5. **DND / User Prefs**: Respect user-defined quiet hours and channel preferences.

### Non-Functional Requirements
1. **Low Latency**: High-priority notifications should be delivered in seconds.
2. **High Scalability**: Support a surge of 10M+ notifications during peak events (e.g., Black Friday).
3. **High Availability**: The system must not lose notifications if a provider is down.

## API Design

```typescript
class NotificationService {
  /**
   * Triggers a notification sending process.
   */
  notify(userId: string, payload: NotificationPayload): string;

  /**
   * Updates user notification preferences.
   */
  updateSettings(userId: string, settings: UserSettings): void;
}
```

## Examples

**Input**: `notify("user_123", {title: "Security Alert", body: "Login from new device", priority: "HIGH"})`
**Result**: System determines user prefers Push + Email -> Queues both -> Worker sends to FCM and SES.

## Constraints
- Integration with various 3rd party APIs with different rate limits.
- Tracking delivery status and click-through rates.
- Handling massive fan-out (e.g., celebrity post notification).
