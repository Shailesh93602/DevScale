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
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'default',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
    green:
      'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
    purple:
      'bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400',
    orange:
      'bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400',
    default: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  const iconColorClass = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`rounded-full p-2 ${iconColorClass}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4">
          {trend && (
            <div
              className={`inline-flex items-center text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
            >
              <span>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {trend ? ' ' : ''}
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
