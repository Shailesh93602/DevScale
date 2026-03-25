import React from 'react';
import { motion } from 'framer-motion';
import {
  LucideIcon,
  Trophy,
  Star,
  Flame,
  Award,
  Target,
  BookOpen,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface AchievementItemProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  fire: Flame,
  award: Award,
  target: Target,
  book: BookOpen,
};

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  uncommon:
    'text-green-500 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
  rare: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  epic: 'text-purple-500 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
  legendary:
    'text-amber-500 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
};

const AchievementItem: React.FC<AchievementItemProps> = ({
  title,
  description,
  icon,
  unlockedAt,
  rarity = 'common',
}) => {
  const Icon = ICON_MAP[icon] || Trophy;
  const colorClass = RARITY_COLORS[rarity];
  const formattedDate = formatDate(unlockedAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800"
    >
      <div className={`rounded-full p-2 ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p
          className="text-sm text-gray-500 dark:text-gray-400"
          title={description}
        >
          {description}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Unlocked {formattedDate}
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementItem;
