# Implement Push Notifications

## Problem Description

Build a **push notification processing system** that handles notification delivery logic including channel filtering, quiet hours, and priority-based overrides.

## Requirements

1. Check if notifications are globally enabled
2. Check if the notification channel is in user's subscribed channels
3. Respect quiet hours (do not deliver during quiet hours unless priority is "urgent")
4. Group notifications by channel for badge counting
5. Return whether to deliver and the processed notification

## Function Signature

```typescript
interface Notification {
  title: string;
  body: string;
  channel: string;
  priority: "low" | "normal" | "high" | "urgent";
  data?: Record<string, any>;
}

interface UserPreferences {
  enabled: boolean;
  channels: string[];
  quietHours: { start: number; end: number };
}

interface NotificationResult {
  shouldDeliver: boolean;
  reason?: string;
  notification?: Notification;
}

function processNotification(
  notification: Notification,
  preferences: UserPreferences,
  currentHour: number
): NotificationResult
```

## Example

```
Input:
  notification = { title: "Sale!", body: "50% off", channel: "promotions", priority: "high" }
  preferences = { enabled: true, channels: ["promotions"], quietHours: { start: 22, end: 7 } }
  currentHour = 10

Output:
  { shouldDeliver: true, notification: { title: "Sale!", body: "50% off", channel: "promotions", priority: "high" } }
```

## Constraints

- Quiet hours: start > end means overnight (e.g., 22:00 to 7:00)
- Priority "urgent" bypasses quiet hours
- Disabled notifications block everything
