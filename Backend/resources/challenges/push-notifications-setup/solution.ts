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

export { processNotification, Notification, UserPreferences, NotificationResult };
