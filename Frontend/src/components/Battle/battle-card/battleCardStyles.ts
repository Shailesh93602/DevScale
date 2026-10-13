export const STATUS_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  LOBBY: 'Lobby',
  IN_PROGRESS: 'Live',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  LOBBY: 'bg-amber-500/15 text-warning border-amber-500/20',
  IN_PROGRESS: 'bg-emerald-500/15 text-success border-emerald-500/20',
  COMPLETED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const STATUS_BAR_COLORS: Record<string, string> = {
  WAITING: 'border-t-blue-500',
  LOBBY: 'border-t-amber-500',
  IN_PROGRESS: 'border-t-emerald-500',
  COMPLETED: 'border-t-muted-foreground',
  CANCELLED: 'border-t-destructive',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-success border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-warning border-amber-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  topic: 'Topic',
  subject: 'Subject',
  main_concept: 'Concept',
  roadmap: 'Roadmap',
  dsa: 'DSA',
};

export function battleSourceLabel(battle: {
  topic?: { title?: string } | null;
  question_source_type?: string | null;
}): string | null {
  if (battle.topic?.title) return battle.topic.title;
  if (battle.question_source_type) {
    return (
      SOURCE_TYPE_LABELS[battle.question_source_type] ??
      battle.question_source_type
    );
  }
  return null;
}
