import { useEffect, useState } from 'react';

export const useMediaQuery = (mediaQuery: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [mediaQuery]);

  return matches;
};
