# Design a Notification System

Design a highly scalable and reliable notification system that can deliver messages through various channels such as Push Notifications (iOS/Android), SMS, and Email.

## Requirements

### Functional Requirements
1. **Multi-Channel Support**: Support Apple Push Notification service (APNs), Firebase Cloud Messaging (FCM), SMS (e.g., Twilio), and Email (e.g., AWS SES).
2. **User Preferences**: Honor user-defined settings for which channels they want to receive notifications on.
3. **Prioritization**: Support urgent (transactional) vs. non-urgent (promotional) categories.
4. **Retry Mechanism**: If a 3rd-party provider fails, the system should automatically retry.
5. **Deduplication**: Prevent sending duplicate messages to users if the same trigger occurs multiple times.

### Non-Functional Requirements
1. **Scalability**: Handle bursts of millions of notifications per minute.
2. **High Availability**: The system should be resilient to individual component or provider failures.
3. **Low Latency**: For high-priority messages, delivery should occur in near real-time.

## System Architecture

Key components to include in your design:
*   **Notification Store**: Database to store user settings, devices, and notification history.
*   **Rate Limiter**: Prevent overloading the system or 3rd-party providers.
*   **Message Queues**: Decouple the request ingestion from the actual sending process.
*   **Workers**: Specialized processes for each channel (Email, SMS, Push) that poll queues and interact with providers.
*   **Analytics/Tracking**: Log clicks, opens (for email), and delivery statuses.

## Examples

**Example Scenario**:
1. User A triggers a "Password Change" event.
2. The system checks User A's settings and sees they have Email enabled.
3. The system queues an Email job.
4. The Email Worker picks up the job, formats a template, and calls AWS SES API.
5. System logs "Sent" and later updates to "Delivered" via a webhook from SES.

## Constraints
- Max payload size for push notifications: 4KB.
- Handle massive fan-out (e.g., a "Breaking News" alert to 100M users).
- Deduplication key: Use a hash of `(userId, messageCode, optionalData)` to avoid duplicates.

