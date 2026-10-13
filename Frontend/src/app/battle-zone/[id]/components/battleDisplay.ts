import { format } from 'date-fns';

export const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  LOBBY: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  IN_PROGRESS: 'bg-green-500/10 text-green-500 border-green-500/20',
  COMPLETED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const STATUS_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  LOBBY: 'Lobby — Get Ready',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TYPE_LABELS: Record<string, string> = {
  QUICK: 'Quick',
  SCHEDULED: 'Scheduled',
  PRACTICE: 'Practice',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const PODIUM_CLASSES = [
  'bg-yellow-500 text-white',
  'bg-gray-400 text-white',
  'bg-amber-700 text-white',
];

/** Medal colour for the top three places; `medal: false` forces the neutral chip. */
export function rankChipClass(index: number, medal = true): string {
  return (medal && PODIUM_CLASSES[index]) || 'bg-muted text-muted-foreground';
}

export function formatBattleDate(d?: string | null): string | null {
  if (!d) return null;
  try {
    return format(new Date(d), 'MMM d, yyyy h:mm a');
  } catch {
    return null;
  }
}
