import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Battle } from '@/types/battle';
import { cn } from '@/lib/utils';
import {
  Trophy,
  Clock,
  Users,
  Brain,
  Timer,
  HelpCircle,
  Target,
  Award,
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

interface BattleInformationProps {
  battle: Battle;
  isLoading?: boolean;
}

const BattleInformation: React.FC<BattleInformationProps> = ({
  battle,
  isLoading = false,
}) => {
  const infoItems = [
    {
      icon: Trophy,
      label: 'Prize',
      value: `${battle.prize} points`,
    },
    {
      icon: Clock,
      label: 'Duration',
      value: `${Math.round(
        (battle.time_per_question * battle.total_questions) / 60,
      )} minutes`,
    },
    {
      icon: Users,
      label: 'Participants',
      value: `${battle.currentParticipants} / ${battle.maxParticipants}`,
    },
    {
      icon: Brain,
      label: 'Difficulty',
      value: battle.difficulty,
      badge: true,
      variant: getDifficultyVariant(battle.difficulty),
    },
    {
      icon: Timer,
      label: 'Time per Question',
      value: `${battle.time_per_question} seconds`,
    },
    {
      icon: HelpCircle,
      label: 'Total Questions',
      value: `${battle.total_questions} questions`,
    },
    {
      icon: Target,
      label: 'Points per Question',
      value: `${battle.points_per_question} points`,
    },
    {
      icon: Award,
      label: 'Category',
      value: battle.category,
      badge: true,
      variant: 'default' as BadgeVariant,
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
          <h3 className="font-medium">Description</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {battle.description}
          </p>
        </div>

        <Separator />

        {/* Battle Details */}
        <div className="grid gap-6 sm:grid-cols-2">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
              }}
              className="flex items-center gap-4"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isLoading ? 'animate-pulse bg-muted' : 'bg-primary/10',
                )}
              >
                {!isLoading && <item.icon className="h-5 w-5 text-primary" />}
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                {item.badge ? (
                  <Badge
                    variant={item.variant || 'default'}
                    className={cn(
                      'mt-1',
                      isLoading && 'animate-pulse bg-muted',
                    )}
                  >
                    {item.value}
                  </Badge>
                ) : (
                  <p
                    className={cn(
                      'font-medium',
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

        <Separator />

        {/* Battle Rules */}
        <div>
          <h3 className="font-medium">Rules</h3>
          <ul className="mt-2 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Each question has a time limit of {battle.time_per_question}{' '}
              seconds
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              You can earn up to {battle.points_per_question} points per
              question
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              The faster you answer correctly, the more points you earn
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Wrong answers will not deduct points
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              The participant with the most points at the end wins
            </motion.li>
          </ul>
        </div>
      </motion.div>
    </Card>
  );
};

export default BattleInformation;
