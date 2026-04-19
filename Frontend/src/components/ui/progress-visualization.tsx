'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressVisualizationProps {
  className?: string;
  steps?: number;
  activeStep?: number;
  labels?: string[];
  colors?: string[];
  animate?: boolean;
}

export const ProgressVisualization = ({
  className,
  steps = 5,
  activeStep = 3,
  labels = ['Beginner', 'Learning', 'Practicing', 'Advanced', 'Expert'],
  colors = ['#8300b8', '#690091', '#8300b826', '#690091', '#8300b8'],
  animate = true,
}: ProgressVisualizationProps) => {
  const [currentStep, setCurrentStep] = useState(() =>
    animate ? 0 : activeStep,
  );

  // Animate through steps if animate is true
  useEffect(() => {
    if (!animate) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev >= steps - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [animate, steps]);

  useEffect(() => {
    if (!animate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(activeStep);
    }
  }, [animate, activeStep]);

  return (
    <div className={cn('relative w-full rounded-lg p-6', className)}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">
          Your Learning Journey
        </h3>
        <div className="text-sm text-muted-foreground">
          {currentStep + 1}/{steps} - {labels[currentStep]}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-8 h-3 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: `linear-gradient(to right, ${colors[currentStep]}, ${colors[currentStep === steps - 1 ? 0 : currentStep + 1]})`,
            width: `${((currentStep + 1) / steps) * 100}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Step indicators */}
      <div className="relative mb-4 flex w-full justify-between">
        {Array.from({ length: steps }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full border-2',
              index <= currentStep
                ? 'border-primary bg-primary text-white'
                : 'border-muted bg-card text-muted-foreground',
            )}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: index === currentStep ? 1.1 : 1,
              opacity: index <= currentStep ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          >
            {index + 1}
          </motion.div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex w-full justify-between px-1 text-xs">
        {labels.map((label, index) => (
          <motion.div
            key={index}
            className={cn(
              'text-center',
              index === currentStep
                ? 'font-bold text-primary'
                : 'text-muted-foreground',
            )}
            initial={{ translateY: 10, opacity: 0 }}
            animate={{
              translateY: 0,
              opacity: index <= currentStep ? 1 : 0.7,
            }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {label}
          </motion.div>
        ))}
      </div>

      {/* Skill cards */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {['Problem Solving', 'Technical Skills', 'Career Growth'].map(
          (skill, index) => (
            <motion.div
              key={skill}
              className="rounded-lg border border-border bg-card p-3 shadow-sm"
              initial={{ translateY: 20, opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep + 1) * (100 / steps) * (1 + index * 0.1)}%`,
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
              <div className="text-xs font-medium">{skill}</div>
            </motion.div>
          ),
        )}
      </div>

      {/* Achievement badge */}
      {currentStep >= steps - 2 && (
        <motion.div
          className="bg-yellow-500 absolute -right-4 -top-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 15l-2-2h4l-2 2z" />
            <path d="M10 7l2 2 2-2" />
            <path d="M8 9l2 2-2 2" />
            <path d="M16 9l-2 2 2 2" />
            <path d="M19 6.873a2 2 0 011 1.747v6.536a2 2 0 01-1.029 1.748l-6 3.833a2 2 0 01-1.942 0l-6-3.833A2 2 0 014 15.157V8.62a2 2 0 011.029-1.748l6-3.572a2.056 2.056 0 012 0l6 3.573z" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
