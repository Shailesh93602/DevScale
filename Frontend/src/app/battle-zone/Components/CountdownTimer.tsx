import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  targetTime: Date | number | string;
  onComplete?: () => void;
  title?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  autoStart?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetTime,
  onComplete,
  title = 'Battle starts in',
  showProgress = true,
  size = 'md',
  autoStart = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    total: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isActive] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);

  // Calculate initial time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(targetTime).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsCompleted(true);
        setTimeLeft({
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        if (onComplete) {
          onComplete();
        }

        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        total: difference,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeLeft();
  }, [targetTime, onComplete]);

  // Start countdown
  useEffect(() => {
    if (!isActive || isCompleted) return;

    const interval = setInterval(() => {
      const targetDate = new Date(targetTime).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsCompleted(true);
        setTimeLeft({
          total: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        if (onComplete) {
          onComplete();
        }

        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        total: difference,
        days,
        hours,
        minutes,
        seconds,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isCompleted, targetTime, onComplete]);

  // Calculate total time (for progress bar)
  const calculateTotalTime = () => {
    const targetDate = new Date(targetTime).getTime();
    const now = new Date().getTime();
    const initialDifference = targetDate - now;

    // If the target time is in the past, return 0
    if (initialDifference <= 0) return 0;

    // For simplicity, we'll use a fixed total time of 10 minutes if the difference is greater
    const maxTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    return Math.min(initialDifference, maxTime);
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalTime = calculateTotalTime();
    if (totalTime <= 0) return 100;

    const elapsedTime = totalTime - timeLeft.total;
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  // Format time display based on size
  const getTimeDisplay = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Play className="h-5 w-5 text-green-500" />
          <span className="text-green-500">Ready to start!</span>
        </div>
      );
    }

    if (timeLeft.days > 0) {
      return (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.days}
            </div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Minutes</div>
          </div>
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Seconds</div>
          </div>
        </div>
      );
    }

    if (timeLeft.hours > 0) {
      return (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Minutes</div>
          </div>
          <div className="text-center">
            <div
              className={`font-mono ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'} font-bold`}
            >
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground">Seconds</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div
            className={`font-mono ${size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl'} font-bold`}
          >
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">Minutes</div>
        </div>
        <div className="text-center text-2xl font-bold">:</div>
        <div className="text-center">
          <div
            className={`font-mono ${size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-2xl'} font-bold`}
          >
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground">Seconds</div>
        </div>
      </div>
    );
  };

  // Determine if we should show a warning (less than 1 minute left)
  const showWarning = timeLeft.total > 0 && timeLeft.total < 60000;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{title}</span>
            </div>
          </CardTitle>
          {showWarning && (
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            >
              Starting Soon
            </Badge>
          )}
          {isCompleted && (
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              Ready
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getTimeDisplay()}

          {showProgress && !isCompleted && (
            <div className="space-y-2">
              <Progress value={calculateProgress()} className="h-2" />
              {showWarning && (
                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>Battle starting soon! Get ready!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
