import type { ComponentType, ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Battle } from '@/types/battle';
import type { BattleDetailState } from '../hooks/useBattleDetail';

export type LoadedBattleState = BattleDetailState & { battle: Battle };

export function UserAvatar({
  username,
  avatarUrl,
  className = 'h-8 w-8',
}: {
  username: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl ?? ''} />
      <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

/** Spinner while an action is in flight, otherwise the action's own icon. */
export function ActionIcon({
  loading,
  icon: Icon,
}: {
  loading: boolean;
  icon: ComponentType<{ className?: string }>;
}) {
  return loading ? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  ) : (
    <Icon className="mr-2 h-4 w-4" />
  );
}

export function QuestionsMissingNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-yellow-500/40 bg-yellow-500/10 flex items-start gap-3 rounded-xl border p-4">
      <AlertCircle className="text-yellow-600 mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-yellow-700 font-semibold">{title}</p>
        <p className="text-yellow-600 mt-0.5 text-sm">{children}</p>
      </div>
    </div>
  );
}

export function questionProgress(battle: Battle) {
  const questionCount = battle._count?.questions ?? 0;
  return {
    questionCount,
    questionsReady: questionCount >= battle.total_questions,
  };
}
