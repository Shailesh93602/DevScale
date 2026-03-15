'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  FaTrophy,
  FaCode,
  FaLaptopCode,
  FaBrain,
  FaChartLine,
} from 'react-icons/fa';

interface EnhancedProgressVisualizationProps {
  className?: string;
}

export const EnhancedProgressVisualization = ({
  className,
}: EnhancedProgressVisualizationProps) => {
  const [activeSkill, setActiveSkill] = useState<number>(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const skills = [
    {
      name: 'Problem Solving',
      level: 3,
      progress: 65,
      icon: <FaBrain className="text-purple-500" />,
      color: 'from-purple-500 to-purple-700',
      description: 'Tackle complex problems with algorithmic thinking',
      achievements: [
        'Solved 50+ problems',
        'Mastered recursion',
        'Optimized solutions',
      ],
    },
    {
      name: 'Coding Skills',
      level: 4,
      progress: 80,
      icon: <FaCode className="text-blue-500" />,
      color: 'from-blue-500 to-blue-700',
      description: 'Write clean, efficient, and maintainable code',
      achievements: [
        'Learned 3 languages',
        'Built 10+ projects',
        'Code review expert',
      ],
    },
    {
      name: 'System Design',
      level: 2,
      progress: 40,
      icon: <FaLaptopCode className="text-green-500" />,
      color: 'from-green-500 to-green-700',
      description: 'Design scalable and efficient systems',
      achievements: [
        'Basic architecture',
        'Database design',
        'API development',
      ],
    },
    {
      name: 'Career Growth',
      level: 3,
      progress: 60,
      icon: <FaChartLine className="text-amber-500" />,
      color: 'from-amber-500 to-amber-700',
      description: 'Advance your professional engineering career',
      achievements: ['Resume building', 'Interview prep', 'Networking skills'],
    },
  ];

  // Auto-rotate through skills
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        setActiveSkill((prev) => (prev + 1) % skills.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnimating, skills.length]);

  // Handle skill click
  const handleSkillClick = (index: number) => {
    setIsAnimating(true);
    setActiveSkill(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card p-6',
        className,
      )}
    >
      {/* Background decorative elements */}
      <div className="bg-primary/10 absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"></div>
      <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"></div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Your Learning Dashboard
        </h3>
        <div className="bg-primary/20 flex items-center rounded-full px-3 py-1 text-sm font-medium text-primary">
          <FaTrophy className="mr-1" size={14} />
          Level {skills[activeSkill].level}
        </div>
      </div>

      {/* Main skill display */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="mb-2 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary2 text-white shadow-lg">
                {skills[activeSkill].icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  {skills[activeSkill].name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {skills[activeSkill].description}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="text-sm font-bold text-primary">
                  {skills[activeSkill].progress}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${skills[activeSkill].color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${skills[activeSkill].progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-6">
              <h5 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Achievements
              </h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {skills[activeSkill].achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-center rounded-lg border border-border bg-muted/20 p-2 text-sm"
                  >
                    <div className="bg-green-500 mr-2 h-2 w-2 rounded-full"></div>
                    {achievement}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive skill selector */}
      <div className="relative mt-8">
        <h5 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your Skills
        </h5>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              className={cn(
                'group relative cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-300',
                activeSkill === index
                  ? 'bg-primary/10 border-primary'
                  : 'hover:border-primary/50 hover:bg-primary/5 border-border bg-card',
              )}
              onClick={() => handleSkillClick(index)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {skill.icon}
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {skill.level}
                </div>
              </div>
              <div className="mt-2">
                <h6 className="font-medium text-foreground">{skill.name}</h6>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                    style={{ width: `${skill.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Hover effect */}
              <AnimatePresence>
                {hoverIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="from-primary/90 to-primary2/90 absolute inset-0 flex items-center justify-center bg-gradient-to-br text-white"
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{skill.progress}%</div>
                      <div className="text-xs">Tap to view</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next milestone */}
      <motion.div
        className="border-primary/20 bg-primary/5 mt-6 rounded-xl border p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
            <FaTrophy size={20} />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-muted-foreground">
              Next Milestone
            </h5>
            <p className="text-base font-bold text-foreground">
              Complete 5 more challenges to reach Level{' '}
              {skills[activeSkill].level + 1}
            </p>
          </div>
        </div>
        <div className="bg-primary/20 mt-3 h-2 w-full overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};
