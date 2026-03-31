import { useEffect, useRef } from "react";
import useConfigStore from "../state/state-management";

const FORCED_CAT_STORAGE_KEY = "lastTimeWeForcedThatCatForYouInMs";
const ONEKO_SCRIPT_ID = "oneko-script";

function isAprilFirst(date: Date): boolean {
  return date.getMonth() === 3 && date.getDate() === 1;
}

function hasForcedCatThisYear(now: Date): boolean {
  const rawValue = localStorage.getItem(FORCED_CAT_STORAGE_KEY);
  if (!rawValue) {
    return false;
  }

  const timestamp = Number(rawValue);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return false;
  }

  return new Date(timestamp).getFullYear() === now.getFullYear();
}

export function CatCompanionController() {
  const catCompanionEnabled = useConfigStore(
    (state) => state.config.catCompanion || false,
  );
  const setConfig = useConfigStore((state) => state.setConfig);
  const hasCheckedAprilForceRef = useRef(false);

  useEffect(() => {
    if (hasCheckedAprilForceRef.current) {
      return;
    }

    hasCheckedAprilForceRef.current = true;

    const now = new Date();
    if (!isAprilFirst(now) || hasForcedCatThisYear(now)) {
      return;
    }

    localStorage.setItem(FORCED_CAT_STORAGE_KEY, String(Date.now()));
    setConfig({ catCompanion: true });
  }, [setConfig]);

  useEffect(() => {
    const onekoWindow = window as Window & { __ONEKO_ENABLED__?: boolean };
    onekoWindow.__ONEKO_ENABLED__ = catCompanionEnabled;

    const existingScript = document.getElementById(ONEKO_SCRIPT_ID);
    if (!existingScript && catCompanionEnabled) {
      const script = document.createElement("script");
      script.id = ONEKO_SCRIPT_ID;
      script.src = "/oneko.js";
      script.defer = true;
      document.body.appendChild(script);
      return;
    }

    if (!existingScript) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("oneko:set-enabled", {
        detail: { enabled: catCompanionEnabled },
      }),
    );
  }, [catCompanionEnabled]);

  return null;
}
