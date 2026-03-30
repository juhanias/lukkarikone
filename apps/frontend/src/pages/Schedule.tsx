import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isToday,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Calendar1,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CreateEventDialog from "@/components/CreateEventDialog";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { Button } from "@/components/ui/button";
import { MonthView, ScheduleDay, WeekView } from "../components/schedule";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useDateParam, useViewModeParam } from "../hooks/useScheduleParams";
import {
  useCalendarStore,
  useConfigStore,
  useScheduleStore,
} from "../state/state-management";

const VIEW_MODES = ["day", "week", "month"] as const;

export default function Schedule() {
  const { t, i18n } = useTranslation("schedule");
  const { calendarId } = useParams<{ calendarId: string }>();
  const navigate = useNavigate();
  const { getCalendar, getActiveCalendar, setActiveCalendar } =
    useCalendarStore();

  // URL-based state
  const [dateParam, setDateParam] = useDateParam();
  const [viewMode, setViewMode] = useViewModeParam();

  // Parse date from URL or use today
  const currentDate = useMemo(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  }, [dateParam]);

  const {
    getEventsForDate,
    fetchSchedule,
    isLoading,
    isCheckingHash,
    isFetchingCalendar,
    error,
    clearError,
    lastUpdated,
  } = useScheduleStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { config } = useConfigStore();

  // Validate and set active calendar from URL
  useEffect(() => {
    if (!calendarId) return;

    const calendar = getCalendar(calendarId);
    const activeCalendar = getActiveCalendar();

    // If calendar not found, redirect to active calendar or default
    if (!calendar) {
      if (activeCalendar) {
        navigate(`/app/${activeCalendar.id}`, { replace: true });
      }
      return;
    }

    // Set as active calendar if it's not already
    if (activeCalendar?.id !== calendarId) {
      setActiveCalendar(calendarId);
    }
  }, [calendarId, getCalendar, getActiveCalendar, setActiveCalendar, navigate]);

  const activeCalendar = getActiveCalendar();
  const [isOnboardingActive, setIsOnboardingActive] = useState(!activeCalendar);

  useEffect(() => {
    if (!activeCalendar) {
      setIsOnboardingActive(true);
    }
  }, [activeCalendar]);

  const getWeekStart = useCallback((date: Date) => {
    return startOfWeek(date, { weekStartsOn: 1 }); // Monday
  }, []);

  const goToNextDay = useCallback(() => {
    const nextDate = addDays(currentDate, 1);
    setDateParam(format(nextDate, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const goToPreviousDay = useCallback(() => {
    const prevDate = subDays(currentDate, 1);
    setDateParam(format(prevDate, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const goToNextWeek = useCallback(() => {
    const nextWeek = addWeeks(currentDate, 1);
    setDateParam(format(nextWeek, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const goToPreviousWeek = useCallback(() => {
    const prevWeek = subWeeks(currentDate, 1);
    setDateParam(format(prevWeek, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const goToNextMonth = useCallback(() => {
    const nextMonth = addMonths(currentDate, 1);
    setDateParam(format(nextMonth, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const goToPreviousMonth = useCallback(() => {
    const prevMonth = subMonths(currentDate, 1);
    setDateParam(format(prevMonth, "yyyy-MM-dd"));
  }, [currentDate, setDateParam]);

  const rotateViewMode = useCallback(
    (direction: "forward" | "backward") => {
      const currentIndex = VIEW_MODES.indexOf(viewMode);

      if (currentIndex === -1) {
        return;
      }

      const step = direction === "forward" ? 1 : -1;
      const nextIndex =
        (currentIndex + step + VIEW_MODES.length) % VIEW_MODES.length;

      setViewMode(VIEW_MODES[nextIndex]);
    },
    [viewMode, setViewMode],
  );

  // Fetch schedule on component mount
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useDocumentTitle(`${t("title")} — Avoin Lukkari`);

  // Show toast notification on error
  useEffect(() => {
    if (error) {
      toast.error(t("errors.updateFailed"), {
        description: `${t("errors.updateFailedDescription")} ${t("errors.errorCode")}: ${error}`,
        action: {
          label: t("errors.dismiss"),
          onClick: () => clearError(),
        },
      });
    }
  }, [error, clearError, t]);

  // Get events for the current date (only for day view)
  const currentEvents = useMemo(() => {
    if (viewMode !== "day") {
      return [];
    }

    const dayEvents = getEventsForDate(currentDate);
    if (config.allowCustomEvents) {
      return dayEvents;
    }

    return dayEvents.filter((event) => !event.id.startsWith("meow-"));
  }, [viewMode, getEventsForDate, currentDate, config.allowCustomEvents]);
  const isWeekView = viewMode === "week";
  const isMonthView = viewMode === "month";
  const viewKey = isMonthView
    ? startOfMonth(currentDate).toDateString()
    : isWeekView
      ? getWeekStart(currentDate).toDateString()
      : currentDate.toDateString();

  const lastUpdatedDisplay = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }

    // Ensure lastUpdated is a Date object (it might be a string from localStorage)
    const lastUpdatedDate =
      lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);

    // Validate the date
    if (Number.isNaN(lastUpdatedDate.getTime())) {
      return null;
    }

    try {
      if (isToday(lastUpdatedDate)) {
        const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
          hour: "2-digit",
          minute: "2-digit",
        });
        return t("status.updatedAt", {
          time: timeFormatter.format(lastUpdatedDate),
        });
      }

      const dateTimeFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      return t("status.updatedAt", {
        time: dateTimeFormatter.format(lastUpdatedDate),
      });
    } catch {
      if (isToday(lastUpdatedDate)) {
        return t("status.updatedAt", {
          time: lastUpdatedDate.toLocaleTimeString(),
        });
      }
      return t("status.updatedAt", { time: lastUpdatedDate.toLocaleString() });
    }
  }, [lastUpdated, i18n.language, t]);

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (isTransitioning) return;

      setIsTransitioning(true);

      if (viewMode === "day") {
        if (direction === "left") {
          goToNextDay();
        } else {
          goToPreviousDay();
        }
      } else if (viewMode === "week") {
        if (direction === "left") {
          goToNextWeek();
        } else {
          goToPreviousWeek();
        }
      } else {
        if (direction === "left") {
          goToNextMonth();
        } else {
          goToPreviousMonth();
        }
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 2);
    },
    [
      isTransitioning,
      viewMode,
      goToNextDay,
      goToPreviousDay,
      goToNextWeek,
      goToPreviousWeek,
      goToNextMonth,
      goToPreviousMonth,
    ],
  );

  const handlePanEnd = (
    _event: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const threshold = 50;
    const velocity = Math.abs(info.velocity.x);
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || velocity > 500) {
      if (offset > 0) {
        handleSwipe("right");
      } else {
        handleSwipe("left");
      }
    }
  };

  const viewTransition = {
    initial: { opacity: 0.96, scale: 0.99 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.12, ease: "easeOut" as const },
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      // probably won't happen butttt....
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (to allow browser shortcuts)
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      // Handle navigation based on view mode
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handleSwipe("right"); // Left arrow goes to previous
          break;
        case "ArrowRight":
          event.preventDefault();
          handleSwipe("left"); // Right arrow goes to next
          break;
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          rotateViewMode(event.key === "ArrowUp" ? "backward" : "forward");
          break;
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSwipe, rotateViewMode]);

  if (isOnboardingActive) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setIsOnboardingActive(false);
          fetchSchedule();
        }}
      />
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Loading and Error States */}
      {isLoading && (
        <div
          className="absolute inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
          style={{ backgroundColor: "var(--color-background-alpha-60)" }}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto"
              style={{
                borderColor: "var(--color-accent)",
                borderTopColor: "transparent",
              }}
            ></div>
            <p
              className="mt-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("loading.schedule")}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons - Fixed at top */}
      <div
        className="flex flex-col border-b"
        style={{
          backgroundColor: "var(--color-surface-alpha-40)",
          borderColor: "var(--color-border-alpha-30)",
        }}
      >
        {/* View Tabs (mobile) */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-4 md:hidden">
          <div
            className="flex rounded-lg p-1"
            style={{
              backgroundColor: "var(--color-surface-secondary-alpha-30)",
            }}
          >
            <Button
              onClick={() => setViewMode("day")}
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
            >
              <Calendar1 className="h-4 w-4" />
              <span>{t("navigation.day")}</span>
            </Button>
            <Button
              onClick={() => setViewMode("week")}
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
            >
              <Calendar className="h-4 w-4" />
              <span>{t("navigation.week")}</span>
            </Button>
            <Button
              onClick={() => setViewMode("month")}
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              className="flex-1 gap-1.5 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
            >
              <CalendarDays className="h-4 w-4" />
              <span>{t("navigation.month")}</span>
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center p-4">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">
            <Button
              onClick={() => handleSwipe("right")}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="p-3 rounded-full disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <ChevronLeft size={20} />
            </Button>

            <div className="flex items-center gap-2 min-w-0">
              <div
                className="hidden md:flex rounded-lg p-1"
                style={{
                  backgroundColor: "var(--color-surface-secondary-alpha-30)",
                }}
              >
                <Button
                  onClick={() => setViewMode("day")}
                  variant={viewMode === "day" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 min-w-28 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                >
                  <Calendar1 className="h-4 w-4" />
                  <span>{t("navigation.day")}</span>
                </Button>
                <Button
                  onClick={() => setViewMode("week")}
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 min-w-28 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t("navigation.week")}</span>
                </Button>
                <Button
                  onClick={() => setViewMode("month")}
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  className="gap-1.5 min-w-28 min-h-9 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>{t("navigation.month")}</span>
                </Button>
              </div>

              <Button
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (currentDate.getTime() !== today.getTime()) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setDateParam(null); // null means use today
                      setIsTransitioning(false);
                    }, 2);
                  }
                }}
                size="sm"
                className="px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: "var(--color-accent-alpha-20)",
                  color: "var(--color-accent)",
                }}
              >
                {t("navigation.today")}
              </Button>
            </div>

            <Button
              onClick={() => handleSwipe("left")}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="p-3 rounded-full disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Swipeable Schedule Container */}
      <div className="flex-1 relative">
        <motion.div
          key={viewKey} // Key ensures re-render on date/view change
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handlePanEnd}
          initial={viewTransition.initial}
          animate={viewTransition.animate}
          transition={viewTransition.transition}
        >
          <div className="h-full overflow-y-auto">
            {viewMode === "day" ? (
              <ScheduleDay
                date={currentDate}
                events={currentEvents}
                lastUpdatedLabel={lastUpdatedDisplay}
                isCheckingHash={isCheckingHash}
                isFetchingCalendar={isFetchingCalendar}
                hasError={!!error}
              />
            ) : viewMode === "week" ? (
              <WeekView
                currentDate={currentDate}
                setViewMode={setViewMode}
                lastUpdatedLabel={lastUpdatedDisplay}
                isCheckingHash={isCheckingHash}
                isFetchingCalendar={isFetchingCalendar}
                hasError={!!error}
              />
            ) : (
              <MonthView
                currentDate={currentDate}
                setViewMode={setViewMode}
                lastUpdatedLabel={lastUpdatedDisplay}
                isCheckingHash={isCheckingHash}
                isFetchingCalendar={isFetchingCalendar}
                hasError={!!error}
              />
            )}
          </div>
        </motion.div>

        {config.allowCustomEvents && (
          <button
            type="button"
            onClick={() => setIsCreateEventOpen(true)}
            className="fixed right-5 bottom-5 md:right-8 md:bottom-8 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-text-on-accent, white)",
              boxShadow: "0 12px 28px var(--color-accent-alpha-30)",
            }}
            aria-label={t("navigation.createEvent")}
          >
            <Plus className="h-6 w-6" />
          </button>
        )}
      </div>

      {config.allowCustomEvents && (
        <CreateEventDialog
          open={isCreateEventOpen}
          onOpenChange={setIsCreateEventOpen}
          initialDate={currentDate}
        />
      )}
    </div>
  );
}
