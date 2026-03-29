import { useState, useEffect } from 'react';

interface UseProgressiveLoadingProps<T> {
  data: T[];
  initialCount?: number;
  increment?: number;
  interval?: number;
}

export function useProgressiveLoading<T>({
  data,
  initialCount = 5,
  increment = 5,
  interval = 300,
}: UseProgressiveLoadingProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>(() => data.slice(0, initialCount));
  const [isLoading, setIsLoading] = useState(() => data.length > 0);

  useEffect(() => {
    if (!data.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleItems([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleItems(data.slice(0, initialCount));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    let currentCount = initialCount;

    const timer = setInterval(() => {
      if (currentCount >= data.length) {
        setIsLoading(false);
        clearInterval(timer);
        return;
      }

      const nextCount = Math.min(currentCount + increment, data.length);
      setVisibleItems(data.slice(0, nextCount));
      currentCount = nextCount;
    }, interval);

    return () => clearInterval(timer);
  }, [data, initialCount, increment, interval]);

  return { visibleItems, isLoading };
}
