'use client';

import { useEffect, useState } from 'react';

/**
 * The current time in `timeZone`, e.g. "9:41 AM PST". Empty until mounted (the server's clock
 * would never match the client's), then re-rendered once per minute, aligned to the minute
 * boundary so it flips exactly when a wall clock does.
 */
export function useLocalTime(timeZone: string | undefined) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (!timeZone) return;
    let format: Intl.DateTimeFormat;
    try {
      format = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = Date.now();
      setTime(format.format(now));
      // A few ms past the boundary so rounding never lands us on the previous minute.
      timer = setTimeout(tick, 60_000 - (now % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, [timeZone]);

  return time;
}
