import { AlertTriangle, Clock3, Info, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useScheduleStore } from "../state/state-management";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface LastUpdatedBadgeProps {
  lastUpdatedLabel: string | null;
  variant?: "full" | "icon-only";
  className?: string;
  isCheckingHash?: boolean;
  isFetchingCalendar?: boolean;
  hasError?: boolean;
}

export const LastUpdatedBadge = ({
  lastUpdatedLabel,
  variant = "full",
  className = "",
  isCheckingHash = false,
  isFetchingCalendar = false,
  hasError = false,
}: LastUpdatedBadgeProps) => {
  const { t, i18n } = useTranslation("schedule");
  const { getICalCacheInfo } = useScheduleStore();

  // Get per-URL cache information
  const cacheInfo = useMemo(() => getICalCacheInfo(), [getICalCacheInfo]);

  // Format individual cache timestamps
  const formatCacheTimestamp = (date: Date | null) => {
    if (!date) return t("status.neverFetched", "Never");

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Determine which icon to show
  const getIcon = () => {
    if (hasError) {
      return (
        <AlertTriangle
          className="h-3.5 w-3.5"
          style={{ color: "var(--color-warning, rgb(234, 179, 8))" }}
        />
      );
    }
    if (isCheckingHash || isFetchingCalendar) {
      return (
        <Loader2
          className="h-3.5 w-3.5 animate-spin"
          style={{ color: "var(--color-accent)" }}
        />
      );
    }
    return (
      <Clock3
        className="h-3.5 w-3.5"
        style={{ color: "var(--color-accent)" }}
      />
    );
  };

  // Get loading status text
  const getStatusText = () => {
    if (hasError) {
      return t("status.error", "Error updating calendar");
    }
    if (isCheckingHash) {
      return t("status.checkingForUpdates", "Checking for updates...");
    }
    if (isFetchingCalendar) {
      return t("status.fetchingCalendar", "Loading calendar...");
    }
    return lastUpdatedLabel;
  };

  const displayText = getStatusText();

  if (!displayText && !isCheckingHash && !isFetchingCalendar && !hasError) {
    return null;
  }

  const BadgeContent = () => (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      style={{
        backgroundColor: hasError
          ? "var(--color-warning-alpha-20, rgba(234, 179, 8, 0.2))"
          : "var(--color-surface-secondary-alpha-30)",
        color: hasError
          ? "var(--color-warning, rgb(234, 179, 8))"
          : "var(--color-text-secondary)",
      }}
    >
      {getIcon()}
      {variant === "full" && <span>{displayText}</span>}
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-none">
          <BadgeContent />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Info
              className="h-4 w-4 mt-0.5 flex-shrink-0"
              style={{ color: "var(--color-accent)" }}
            />
            <div className="flex-1">
              <h4
                className="font-semibold mb-1"
                style={{ color: "var(--color-text)" }}
              >
                {hasError
                  ? t("status.errorTitle", "Error")
                  : t("status.lastRefresh")}
              </h4>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {displayText}
              </p>
            </div>
          </div>

          {/* Show per-URL cache info if multiple URLs */}
          {!hasError && cacheInfo.length > 1 && (
            <div className="space-y-2">
              <h5
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("status.icalSources", "iCal Sources")}
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cacheInfo.map((cache, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 rounded"
                    style={{
                      backgroundColor:
                        "var(--color-surface-secondary-alpha-30)",
                      borderLeft: "2px solid var(--color-accent)",
                    }}
                  >
                    <div
                      className="font-mono text-[10px] mb-1 break-all"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {cache.url}
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {t("status.lastUpdated", "Last updated")}:
                      </span>
                      <span style={{ color: "var(--color-text)" }}>
                        {formatCacheTimestamp(cache.lastUpdated)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {t("status.lastFetched", "Last fetched")}:
                      </span>
                      <span style={{ color: "var(--color-text)" }}>
                        {formatCacheTimestamp(cache.lastFetched)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasError && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("status.refreshInfo")}
            </p>
          )}
          {hasError && lastUpdatedLabel && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("status.errorInfo", { time: lastUpdatedLabel })}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
