"use client";

import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query. Starts as `false` on the server and on the
 * first client render so markup stays hydration-stable, then syncs in an effect.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Tailwind's `md` breakpoint — the line where the app switches to the desktop shell. */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)');
