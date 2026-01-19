import { useEffect, useRef, useState } from "react";

/**
 * Returns the current time as a Date object and updates the value exactly when the minute changes.
 */
export const useCurrentTime = (): Date => {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());

    const schedule = () => {
      const current = new Date();
      const msUntilNextMinute =
        (60 - current.getSeconds()) * 1000 - current.getMilliseconds();

      timeoutRef.current = setTimeout(
        () => {
          update();
          intervalRef.current = setInterval(update, 60_000);
        },
        Math.max(msUntilNextMinute, 0),
      );
    };

    schedule();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return now;
};
