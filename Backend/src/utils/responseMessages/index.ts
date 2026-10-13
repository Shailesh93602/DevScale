import { commonMessages } from './common.js';
import { learningMessages } from './learning.js';
import { usersMessages } from './users.js';
import { adminMessages } from './admin.js';
import { communityMessages } from './community.js';
import { battleMessages } from './battle.js';
import { aiMessages } from './ai.js';
import type { ResponseConfig } from './types.js';

export const RESPONSE_MESSAGES = {
  ...commonMessages,
  ...learningMessages,
  ...usersMessages,
  ...adminMessages,
  ...communityMessages,
  ...battleMessages,
  ...aiMessages,
} satisfies Record<string, ResponseConfig>;

export type ResponseType = keyof typeof RESPONSE_MESSAGES;
export type { ResponseConfig };
