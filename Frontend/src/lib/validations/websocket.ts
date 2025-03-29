import * as yup from 'yup';
import { realTimeEventTypes } from '@/types/websocket';

// Chat message schema
const chatMessageSchema = yup.object({
  id: yup.string().required(),
  content: yup.string().required(),
  senderId: yup.string().required(),
  timestamp: yup.string().required(),
});

// Notification schema
const notificationSchema = yup.object({
  id: yup.string().required(),
  type: yup.string().required(),
  message: yup.string().required(),
  createdAt: yup.string().required(),
});

// Presence update schema
const presenceUpdateSchema = yup.object({
  userId: yup.string().required(),
  status: yup.string().oneOf(['online', 'away', 'offline']).required(),
  lastActive: yup.string().required(),
});

// Create a schema that validates based on the event type
export const realTimeEventSchema = yup.object({
  type: yup.string().oneOf(realTimeEventTypes).required(),
  data: yup
    .mixed()
    .when('type', {
      is: 'chat:message',
      then: () => chatMessageSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'notification:new',
      then: () => notificationSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'presence:update',
      then: () => presenceUpdateSchema,
      otherwise: (schema) => schema,
    }),
});
