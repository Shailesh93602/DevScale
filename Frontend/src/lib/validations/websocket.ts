import * as yup from 'yup';
import { realTimeEventTypes } from '@/types/websocket';

const BATTLE_STATUSES = [
  'pending',
  'active',
  'completed',
  'cancelled',
  'UPCOMING',
  'IN_PROGRESS',
] as const;

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

// Battle participant schema
const battleParticipantSchema = yup.object({
  id: yup.string().required(),
  userId: yup.string().required(),
  battleId: yup.string().required(),
  joinedAt: yup.string().required(),
  user: yup
    .object({
      id: yup.string().required(),
      name: yup.string().required(),
      email: yup.string().email().required(),
      avatar: yup.string().nullable(),
    })
    .required(),
});

// Battle join schema
const battleJoinSchema = yup.object({
  battleId: yup.string().required(),
  participant: battleParticipantSchema.required(),
});

// Battle leave schema
const battleLeaveSchema = yup.object({
  battleId: yup.string().required(),
  participantId: yup.string().required(),
});

// Battle ready schema
const battleReadySchema = yup.object({
  battleId: yup.string().required(),
  participantId: yup.string().required(),
  isReady: yup.boolean().required(),
});

// Battle start schema
const battleStartSchema = yup.object({
  battleId: yup.string().required(),
  startTime: yup.string().required(),
});

// Battle end schema
const battleEndSchema = yup.object({
  battleId: yup.string().required(),
  endTime: yup.string().required(),
  results: yup
    .object({
      participants: yup
        .array()
        .of(
          yup.object({
            participantId: yup.string().required(),
            score: yup.number().required(),
            rank: yup.number().required(),
          }),
        )
        .required(),
    })
    .required(),
});

// Battle state update schema
const battleStateUpdateSchema = yup.object({
  battleId: yup.string().required(),
  status: yup.string().oneOf(BATTLE_STATUSES).required(),
  currentParticipants: yup.number().required(),
  startTime: yup.string().optional(),
  endTime: yup.string().optional(),
});

// Battle participant update schema
const battleParticipantUpdateSchema = yup.object({
  battleId: yup.string().required(),
  participant: battleParticipantSchema
    .shape({
      isReady: yup.boolean().required(),
      score: yup.number().optional(),
      rank: yup.number().optional(),
    })
    .required(),
});

// Battle score update schema
const battleScoreUpdateSchema = yup.object({
  battleId: yup.string().required(),
  participantId: yup.string().required(),
  score: yup.number().required(),
  rank: yup.number().required(),
});

// Battle chat message schema
const battleChatMessageSchema = yup.object({
  battleId: yup.string().required(),
  message: chatMessageSchema.required(),
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
    })
    .when('type', {
      is: 'battle:join',
      then: () => battleJoinSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:leave',
      then: () => battleLeaveSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:ready',
      then: () => battleReadySchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:start',
      then: () => battleStartSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:end',
      then: () => battleEndSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:state_update',
      then: () => battleStateUpdateSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:participant_update',
      then: () => battleParticipantUpdateSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:score_update',
      then: () => battleScoreUpdateSchema,
      otherwise: (schema) => schema,
    })
    .when('type', {
      is: 'battle:chat_message',
      then: () => battleChatMessageSchema,
      otherwise: (schema) => schema,
    }),
});
