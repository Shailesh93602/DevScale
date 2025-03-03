import { useState, useEffect } from 'react';

export const useIntersection = (
  element: React.RefObject<HTMLElement | null>,
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!element?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '100px',
      },
    );

    observer.observe(element.current);

    return () => {
      if (element.current) {
        observer.unobserve(element.current);
      }
    };
  }, [element]);

  return isIntersecting;
};
