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
  /** Short value for a stat tile. */
  stat: string;
  /** Battle highlight card on the landing page. */
  highlight: { title: string; description: string };
  /** Landing "Live Competitions" card. */
  card: { title: string; description: string };
  /** Landing community intro sentence. */
  doing: string;
  /** About page clause: "...progress through, X, and challenges...". */
  against: string;
  /** About page "Battle Tested" value. */
  tested: string;
  /** Caption under the rating leaderboard. */
  rating: string;
  /** Battles tab of the landing showcase. */
  showcase: string;
  /** Build-time surfaces. Descriptions stay ≤155 characters. */
  meta: {
    description: string;
    openGraph: string;
    twitter: string;
    site: string;
    manifest: string;
    ogImage: string;
  };
}

const LIVE: BattleCopy = {
  feature: 'Real-time quiz battles, matchmaking and leaderboards',
  phrase: 'real-time quiz battles',
  together:
    'Challenge other students to real-time quiz battles and climb the leaderboards.',
  zone: 'The Battle Zone is a competitive quiz arena where you can challenge other students in real-time quiz battles, test your skills, and climb the leaderboard.',
  footnote: 'Real-time battles, career roadmaps and a sandboxed code runner',
  stat: 'Real-Time',
  highlight: {
    title: 'Real-time Battle Zone',
    description:
      'Go head-to-head in live quiz battles with shared questions and a synced timer — practice under real pressure.',
  },
  card: {
    title: 'Live Competitions',
    description:
      'Participate in real-time battles against peers to test your speed and accuracy.',
  },
  doing:
    'Learn by doing — compete in live battles, follow structured roadmaps, and run real code with instant feedback.',
  against: 'real-time battles against another person',
  tested:
    'Timed, scored, live. The Battle Zone is closer to an interview than a tutorial is, and that is the point.',
  rating: 'Top players by competitive rating, live from the Battle Zone.',
  showcase:
    'Head-to-head battles over a live socket connection, scored as you answer.',
  meta: {
    description:
      'EduScale is the all-in-one platform for engineering students: personalized roadmaps, real-time quiz battles, coding challenges and placement prep.',
    openGraph:
      'Personalized roadmaps, real-time quiz battles, and interactive challenges for engineering students.',
    twitter:
      'Personalized roadmaps, real-time quiz battles, and interactive challenges.',
    site: 'Learning platform for engineering students: career roadmaps, coding challenges, real-time battles and placement preparation.',
    manifest:
      'Real-time engineering learning platform with 1v1 quiz battles, distributed locking (Redlock), circuit breakers (opossum), and Prometheus metrics.',
    ogImage:
      'Real-time quiz battles, distributed locking, circuit breakers, Prometheus metrics. Built for engineering students.',
  },
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
  stat: 'Coming Soon',
  highlight: {
    title: 'Battle Zone (coming soon)',
    description:
      'Head-to-head quiz battles with shared questions and a synced timer are coming soon, once the realtime server is live.',
  },
  card: {
    title: 'Live Competitions (coming soon)',
    description:
      'Real-time battles against peers are coming soon, once the realtime server is live.',
  },
  doing:
    'Learn by doing — follow structured roadmaps and run real code with instant feedback. Live quiz battles are coming soon.',
  against:
    'quiz battles against another person (real-time play is coming soon)',
  tested:
    'Timed and scored. The Battle Zone, coming soon, is closer to an interview than a tutorial is, and that is the point.',
  rating:
    'Top players by competitive rating from the Battle Zone. Live battles are coming soon.',
  showcase:
    'Head-to-head quiz battles scored as you answer, coming soon: live play needs a realtime server that is not running yet.',
  meta: {
    description:
      'EduScale is the all-in-one platform for engineering students: personalized roadmaps, coding challenges, placement prep and quiz battles (coming soon).',
    openGraph:
      'Personalized roadmaps, coding challenges and quiz battles (real-time play coming soon) for engineering students.',
    twitter:
      'Personalized roadmaps, coding challenges and quiz battles (real-time play coming soon).',
    site: 'Learning platform for engineering students: career roadmaps, coding challenges, placement preparation and quiz battles (real-time play coming soon).',
    manifest:
      'Engineering learning platform: roadmaps, coding challenges and 1v1 quiz battles (real-time play coming soon). Redlock, opossum, Prometheus.',
    ogImage:
      'Roadmaps, coding challenges and quiz battles (real-time play coming soon). Built for engineering students.',
  },
};

export function battleCopy(): BattleCopy {
  return realtimeBattlesLive() ? LIVE : PENDING;
}
