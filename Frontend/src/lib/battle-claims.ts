import { realtimeApiBase } from './realtime-host';

// Vercel alone runs no sockets or battle timers, so live-battle copy follows the env var that
// routes battles to the realtime host. The leaderboard is battle Elo only, so it goes with them.
export function realtimeBattlesLive(): boolean {
  return realtimeApiBase() !== undefined;
}

export interface BattleCopy {
  /** Pricing feature bullet. */
  feature: string;
  /** Inline noun phrase for lists. */
  phrase: string;
  /** Sentence for "learn with others". */
  together: string;
  /** What the Battle Zone is. */
  zone: string;
  /** Pricing footnote clause. */
  footnote: string;
}

const LIVE: BattleCopy = {
  feature: 'Real-time quiz battles, matchmaking and leaderboards',
  phrase: 'real-time quiz battles',
  together:
    'Challenge other students to real-time quiz battles and climb the leaderboards.',
  zone: 'The Battle Zone is a competitive quiz arena where you can challenge other students in real-time quiz battles, test your skills, and climb the leaderboard.',
  footnote: 'Real-time battles, career roadmaps and a sandboxed code runner',
};

const PENDING: BattleCopy = {
  feature:
    'Real-time quiz battles, matchmaking and leaderboards: coming soon, once the realtime server is live',
  phrase: 'quiz battles (real-time play is coming soon)',
  together:
    'Real-time quiz battles and their leaderboard are coming soon, once the realtime server is live.',
  zone: 'The Battle Zone is a competitive quiz arena for real-time quiz battles against other students, coming soon: live battles, matchmaking and the leaderboard need a realtime server that is not running yet.',
  footnote:
    'Career roadmaps and a sandboxed code runner (real-time battles are coming soon)',
};

export function battleCopy(): BattleCopy {
  return realtimeBattlesLive() ? LIVE : PENDING;
}
