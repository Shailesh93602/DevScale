import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'default';
}

const colorConfig = {
  blue: {
    icon: 'text-blue bg-blue/10',
    accent: 'from-blue/5 to-transparent',
    glow: 'shadow-blue/10',
  },
  green: {
    icon: 'text-green bg-green/10',
    accent: 'from-green/5 to-transparent',
    glow: 'shadow-green/10',
  },
  purple: {
    icon: 'text-purple bg-purple/10',
    accent: 'from-purple/5 to-transparent',
    glow: 'shadow-purple/10',
  },
  orange: {
    icon: 'text-orange bg-orange/10',
    accent: 'from-orange/5 to-transparent',
    glow: 'shadow-orange/10',
  },
  red: {
    icon: 'text-red bg-red/10',
    accent: 'from-red/5 to-transparent',
    glow: 'shadow-red/10',
  },
  default: {
    icon: 'bg-muted text-muted-foreground',
    accent: 'from-muted/40 to-transparent',
    glow: '',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'default',
}) => {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* Subtle gradient background glow */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.accent} opacity-70`}
      />

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.icon} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="relative">
        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>

        {(description || trend) && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${trend.isPositive ? 'text-green' : 'text-red'}`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
