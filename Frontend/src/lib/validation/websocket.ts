import * as yup from 'yup';
import { RealTimeEventMap, realTimeEventTypes } from '@/types/websocket';

// Custom Yup methods
yup.addMethod(yup.string, 'uuid', function () {
  return this.matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'Must be a valid UUID',
  );
});

yup.addMethod(yup.string, 'datetime', function () {
  return this.matches(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/,
    'Must be a valid ISO datetime',
  );
});

// Chat Message Validation
export const chatMessageSchema = yup.object().shape({
  content: yup.string().required().min(1).max(500),
  senderId: yup.string().uuid().required(),
  timestamp: yup.string().datetime().required(),
});

// Notification Schema
export const notificationSchema = yup.object().shape({
  id: yup.string().uuid().required(),
  type: yup.string().required(),
  message: yup.string().required(),
  createdAt: yup.string().datetime().required(),
});

// Presence Update Schema
export const presenceSchema = yup.object().shape({
  userId: yup.string().uuid().required(),
  status: yup.string().oneOf(['online', 'away', 'offline']).required(),
  lastActive: yup.string().datetime().required(),
});

// Complete RealTimeEvent Validation
export const realTimeEventSchema = yup.lazy((value: unknown) => {
  const event = value as { type?: keyof RealTimeEventMap };

  if (!event?.type) {
    return yup.object().shape({
      type: yup.string().required('Event type is required'),
    });
  }

  switch (event.type) {
    case 'chat:message':
      return yup.object().shape({
        type: yup.string().oneOf(['chat:message']).required(),
        data: chatMessageSchema,
      });

    case 'notification:new':
      return yup.object().shape({
        type: yup.string().oneOf(['notification:new']).required(),
        data: notificationSchema,
      });

    case 'presence:update':
      return yup.object().shape({
        type: yup.string().oneOf(['presence:update']).required(),
        data: presenceSchema,
      });

    default:
      return yup.object().shape({
        type: yup.string().required().oneOf(realTimeEventTypes),
      });
  }
});
