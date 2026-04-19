import { useEffect, useState } from 'react';

export const useMediaQuery = (mediaQuery: string) => {
  const [matches, setMatches] = useState(
    () =>
      typeof globalThis.window !== 'undefined' &&
      globalThis.window.matchMedia(mediaQuery).matches,
  );

  useEffect(() => {
    const mediaQueryList = globalThis.window.matchMedia(mediaQuery);
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [mediaQuery]);

  return matches;
};
