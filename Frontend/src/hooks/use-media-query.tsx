import { useEffect, useState } from 'react';

export const useMediaQuery = (mediaQuery: string) => {
  // Always start `false` so the server render and the client's FIRST render
  // agree (the server has no `window`). Reading matchMedia in the initializer
  // made the first client render diverge from the server → hydration mismatch.
  // The real value is applied in the effect, after mount.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = globalThis.window.matchMedia(mediaQuery);
    setMatches(mediaQueryList.matches);
    const handleChange = (event: MediaQueryListEvent) =>
      setMatches(event.matches);

    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [mediaQuery]);

  return matches;
};
