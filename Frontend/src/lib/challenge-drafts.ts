// Unsaved editor code per challenge. Not keyed by user, so it is dropped on
// sign-out: otherwise the next account on this browser opened the previous
// user's solution and its first edit saved it as their own cloud draft.
const PREFIX = 'challenge_progress_';

export const challengeDraftKey = (challengeId: string) =>
  `${PREFIX}${challengeId}`;

export function clearChallengeDrafts() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // unavailable — nothing to clear
  }
}
