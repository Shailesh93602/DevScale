import type { ResponseConfig } from './types.js';

/** AI features: tutor, recommendations, code review and BYO API keys. */
export const aiMessages = {
  CODE_REVIEW_CREATED: {
    status: 201,
    success: true,
    message: 'AI code review generated successfully',
  },
  CODE_REVIEW_FETCHED: {
    status: 200,
    success: true,
    message: 'AI code review retrieved successfully',
  },
  CODE_REVIEW_IN_PROGRESS: {
    // 202: accepted, not finished. The client should retry shortly rather than
    // treat this as an error.
    status: 202,
    success: true,
    message: 'AI code review is being generated — retry in a moment',
  },
  RECOMMENDATIONS_FETCHED: {
    status: 200,
    success: true,
    message: 'Recommendations retrieved successfully',
  },
  CONTENT_REINDEXED: {
    status: 200,
    success: true,
    message: 'Content reindexed successfully',
  },
  TUTOR_ANSWERED: {
    status: 200,
    success: true,
    message: 'Tutor answer generated successfully',
  },
  TUTOR_HINT_PROVIDED: {
    status: 200,
    success: true,
    message: 'Tutor hint generated successfully',
  },
  AI_KEY_FETCHED: {
    status: 200,
    success: true,
    message: 'AI key settings retrieved successfully',
  },
  AI_KEY_SAVED: {
    status: 200,
    success: true,
    message: 'Your API key is saved and encrypted',
  },
  AI_KEY_REMOVED: {
    status: 200,
    success: true,
    message: 'Your API key has been removed',
  },
  // Deliberately says nothing about the value itself. A message like "key must
  // start with AIza" is a free oracle for anyone probing the endpoint, and it
  // is also wrong often enough to block legitimate keys when Google changes a
  // prefix.
  AI_KEY_INVALID: {
    status: 400,
    success: false,
    message:
      'That does not look like an API key. Paste the whole key you copied from Google AI Studio.',
  },
  AI_KEY_STORAGE_UNAVAILABLE: {
    status: 503,
    success: false,
    message:
      'Saving API keys is temporarily unavailable. Nothing was stored — please try again later.',
  },
} satisfies Record<string, ResponseConfig>;
