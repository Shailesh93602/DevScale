import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Battle } from '@/types/battle';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Clock,
  Users,
  Brain,
  Timer,
  HelpCircle,
  Target,
  Award,
  Calendar,
  CalendarOff,
  BarChart2,
} from 'lucide-react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const getDifficultyVariant = (difficulty: string): BadgeVariant => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'default';
    case 'medium':
      return 'secondary';
    default:
      return 'destructive';
  }
};

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'hard':
      return 'text-red-500';
    default:
      return 'text-muted-foreground';
  }
};

interface BattleInformationProps {
  battle: Battle;
  isLoading?: boolean;
}

const BattleInformation: React.FC<BattleInformationProps> = ({
  battle,
  isLoading = false,
}) => {
  const safePointsPerQuestion = Number.isFinite(battle.points_per_question)
    ? battle.points_per_question
    : 0;
  const safeTimePerQuestion = Number.isFinite(battle.time_per_question)
    ? battle.time_per_question
    : 0;
  const safeTotalQuestions = Number.isFinite(battle.total_questions)
    ? battle.total_questions
    : 0;
  const safeDuration = Math.round(
    (safeTimePerQuestion * Math.max(safeTotalQuestions, 1)) / 60,
  );

  // Format dates safely
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'N/A';
    }
  };

  // Use topic title as category (real data from backend)
  const categoryLabel = battle.topic?.title || 'General';

  const infoItems = [
    {
      icon: Clock,
      label: 'Estimated Duration',
      value: `~${safeDuration} minutes`,
    },
    {
      icon: Users,
      label: 'Participants',
      value: `${battle.current_participants} / ${battle.max_participants}`,
    },
    {
      icon: Brain,
      label: 'Difficulty',
      value: battle.difficulty,
      badge: true,
      variant: getDifficultyVariant(battle.difficulty),
      colorClass: getDifficultyColor(battle.difficulty),
    },
    {
      icon: Timer,
      label: 'Time per Question',
      value: `${safeTimePerQuestion} seconds`,
    },
    {
      icon: HelpCircle,
      label: 'Total Questions',
      value: `${safeTotalQuestions} questions`,
    },
    {
      icon: Target,
      label: 'Points per Question',
      value: `${safePointsPerQuestion} points`,
    },
    {
      icon: Award,
      label: 'Topic / Category',
      value: categoryLabel,
      badge: true,
      variant: 'outline' as BadgeVariant,
    },
    {
      icon: Calendar,
      label: 'Start Time',
      value: formatDateTime(battle.start_time ?? ''),
    },
  ];

  return (
    <Card className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Battle Description */}
        <div>
          <h3 className="font-medium">About this Battle</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {battle.description || 'No description provided.'}
          </p>
        </div>

        {/* Battle Creator */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-primary">
            {battle.creator?.username?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created by</p>
            <p className="text-sm font-medium">
              {battle.creator?.username ?? 'Unknown'}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs capitalize">
            {battle.type?.toLowerCase().replace('_', ' ')}
          </Badge>
        </div>

        <Separator />

        {/* Battle Details Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="flex items-center gap-4"
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  isLoading ? 'animate-pulse bg-muted' : 'bg-primary/10',
                )}
              >
                {!isLoading && <item.icon className="h-5 w-5 text-primary" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.badge ? (
                  <Badge
                    variant={item.variant || 'default'}
                    className={cn(
                      'mt-1 capitalize',
                      isLoading && 'animate-pulse bg-muted',
                      item.colorClass,
                    )}
                  >
                    {item.value}
                  </Badge>
                ) : (
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      isLoading && 'animate-pulse text-muted',
                    )}
                  >
                    {item.value}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Card>
  );
};

export default BattleInformation;
