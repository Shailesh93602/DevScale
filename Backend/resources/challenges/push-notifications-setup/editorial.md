# Editorial — Implement Push Notifications

## Approach: Rule-based Filtering Pipeline

### TypeScript Solution

```typescript
function processNotification(
  notification: Notification,
  preferences: UserPreferences,
  currentHour: number
): NotificationResult {
  if (!preferences.enabled) {
    return { shouldDeliver: false, reason: "notifications_disabled" };
  }

  if (!preferences.channels.includes(notification.channel)) {
    return { shouldDeliver: false, reason: "channel_not_subscribed" };
  }

  const { start, end } = preferences.quietHours;
  let isQuietHour = false;
  if (start > end) {
    isQuietHour = currentHour >= start || currentHour < end;
  } else {
    isQuietHour = currentHour >= start && currentHour < end;
  }

  if (isQuietHour && notification.priority !== "urgent") {
    return { shouldDeliver: false, reason: "quiet_hours" };
  }

  return { shouldDeliver: true, notification };
}
```

### Complexity
- **Time**: O(c) where c = number of channels
- **Space**: O(1)
