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

const RARITY_CONFIG: Record<
  string,
  { icon: string; label: string; labelColor: string }
> = {
  common: {
    icon: 'bg-muted text-muted-foreground',
    label: 'Common',
    labelColor: 'text-muted-foreground',
  },
  uncommon: {
    icon: 'bg-green/10 text-green',
    label: 'Uncommon',
    labelColor: 'text-green',
  },
  rare: {
    icon: 'bg-blue/10 text-blue',
    label: 'Rare',
    labelColor: 'text-blue',
  },
  epic: {
    icon: 'bg-purple/10 text-purple',
    label: 'Epic',
    labelColor: 'text-purple',
  },
  legendary: {
    icon: 'bg-orange/10 text-orange',
    label: 'Legendary',
    labelColor: 'text-orange',
  },
};

const AchievementItem: React.FC<AchievementItemProps> = ({
  title,
  description,
  icon,
  unlockedAt,
  rarity = 'common',
}) => {
  const Icon = ICON_MAP[icon] || Trophy;
  const config = RARITY_CONFIG[rarity];
  const formattedDate = formatDate(unlockedAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/40"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.icon}`}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h4>
          <span
            className={`shrink-0 text-[10px] font-medium uppercase tracking-wide ${config.labelColor}`}
          >
            {config.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {description}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          Unlocked {formattedDate}
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementItem;
