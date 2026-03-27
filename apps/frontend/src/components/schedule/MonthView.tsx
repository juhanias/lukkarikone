import { startOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDateParam } from "../../hooks/useScheduleParams";
import { RealizationApiService } from "../../services/realizationApi";
import {
  default as useConfigStore,
  useEventMetadataStore,
  useRealizationMetadataStore,
  useScheduleStore,
} from "../../state/state-management";
import { DateFormatUtils } from "../../utils/date-format-utils";
import {
  buildMonthViewData,
  MONTH_TIMELINE_END_HOUR,
  MONTH_TIMELINE_START_HOUR,
  type MonthDayCellData,
} from "../../utils/month-view-utils";
import { ScheduleUtils } from "../../utils/schedule-utils";
import { CalendarViewBadge } from "../CalendarViewBadge";
import { LastUpdatedBadge } from "../LastUpdatedBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MonthViewProps {
  currentDate: Date;
  setViewMode: (mode: "day" | "week" | "month") => void;
  lastUpdatedLabel?: string | null;
  isCheckingHash?: boolean;
  isFetchingCalendar?: boolean;
  hasError?: boolean;
}

const formatHours = (hours: number) => {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
};

const toDateParam = (date: Date) => date.toISOString().split("T")[0];

const timelineRangeHours = MONTH_TIMELINE_END_HOUR - MONTH_TIMELINE_START_HOUR;

const MonthView = memo(
  ({
    currentDate,
    setViewMode,
    lastUpdatedLabel,
    isCheckingHash,
    isFetchingCalendar,
    hasError,
  }: MonthViewProps) => {
    const { t, i18n } = useTranslation("schedule");
    const [, setDateParam] = useDateParam();

    const { config } = useConfigStore();
    const { events } = useScheduleStore();
    const { metadataByEvent, isEventHidden } = useEventMetadataStore();
    const { metadataByRealization, isRealizationHidden } =
      useRealizationMetadataStore();

    const monthData = useMemo(
      () =>
        buildMonthViewData({
          monthDate: currentDate,
          events,
          metadataByEvent,
          metadataByRealization,
          isEventHidden,
          isRealizationHidden,
        }),
      [
        currentDate,
        events,
        metadataByEvent,
        metadataByRealization,
        isEventHidden,
        isRealizationHidden,
      ],
    );

    const monthTitle = useMemo(() => {
      return new Intl.DateTimeFormat(i18n.language, {
        month: "long",
        year: "numeric",
      }).format(startOfMonth(currentDate));
    }, [currentDate, i18n.language]);

    const dayLabelFormatter = useMemo(
      () =>
        new Intl.DateTimeFormat(i18n.language, {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      [i18n.language],
    );

    const dayNames = DateFormatUtils.getDayNamesShort(true);

    const eventById = useMemo(
      () => new Map(events.map((event) => [event.id, event])),
      [events],
    );

    const navigateToDay = (date: Date) => {
      setDateParam(toDateParam(date));
      setViewMode("day");
    };

    const navigateToWeek = (weekStart: Date) => {
      setDateParam(toDateParam(weekStart));
      setViewMode("week");
    };

    const renderDayCell = (day: MonthDayCellData) => {
      const isToday = DateFormatUtils.isToday(day.date);
      const muted = !day.inCurrentMonth;
      const dayTimelineLabel = `${String(MONTH_TIMELINE_START_HOUR).padStart(2, "0")}:00-${String(MONTH_TIMELINE_END_HOUR).padStart(2, "0")}:00`;

      const getSegmentWidth = (
        segment: MonthDayCellData["timelineSegments"][number],
      ) => {
        const duration = Math.max(0, segment.endHour - segment.startHour);
        return `${(duration / timelineRangeHours) * 100}%`;
      };

      return (
        <button
          key={day.dateKey}
          type="button"
          className="min-h-[122px] p-2 text-left border-l first:border-l-0 transition-colors"
          style={{
            borderColor: "var(--color-border-alpha-30)",
            backgroundColor: isToday
              ? "var(--color-accent-alpha-10)"
              : muted
                ? "var(--color-surface-secondary-alpha-20)"
                : "transparent",
          }}
          onClick={() => navigateToDay(day.date)}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-semibold"
              style={{
                color: muted
                  ? "var(--color-text-secondary)"
                  : "var(--color-text)",
                opacity: muted ? 0.65 : 1,
              }}
            >
              {day.date.getDate()}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {formatHours(day.visibleHours)}h
            </span>
          </div>

          <div className="space-y-1">
            <div
              className="h-[20px] w-full rounded-full overflow-hidden flex"
              style={{ backgroundColor: "var(--color-border-alpha-30)" }}
            >
              {day.timelineSegments.map((segment) => {
                if (!segment.eventId) {
                  return (
                    <div
                      key={segment.id}
                      className="h-full"
                      style={{
                        width: getSegmentWidth(segment),
                        backgroundColor:
                          "var(--color-surface-secondary-alpha-30)",
                      }}
                    />
                  );
                }

                const event = eventById.get(segment.eventId);
                if (!event) {
                  return (
                    <div
                      key={segment.id}
                      className="h-full"
                      style={{
                        width: getSegmentWidth(segment),
                        backgroundColor:
                          "var(--color-surface-secondary-alpha-30)",
                      }}
                    />
                  );
                }

                const colorPair = ScheduleUtils.getColorPair(
                  event.title,
                  event.id,
                  metadataByEvent,
                  metadataByRealization,
                );
                const title = config.showCourseIdInSchedule
                  ? event.title
                  : RealizationApiService.stripRealizationCode(event.title);

                return (
                  <Tooltip key={segment.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full"
                        style={{
                          width: getSegmentWidth(segment),
                          background: colorPair.normal,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>
                      <p className="font-semibold">{title}</p>
                      <p className="opacity-85">
                        {ScheduleUtils.formatTimeRange(
                          event.startTime,
                          event.endTime,
                        )}
                        {` · ${formatHours(event.duration)}h`}
                      </p>
                      <p className="opacity-70">
                        {dayLabelFormatter.format(day.date)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            <p
              className="text-[10px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dayTimelineLabel}
            </p>
          </div>
        </button>
      );
    };

    return (
      <TooltipProvider delayDuration={80}>
        <div className="w-full h-full flex flex-col">
          <div className="w-full flex-shrink-0 bg-[linear-gradient(to_bottom,var(--color-surface-alpha-40),transparent)]">
            <div className="max-w-7xl mx-auto px-4 py-6 relative">
              <div className="absolute left-4 top-4 md:hidden">
                <CalendarViewBadge variant="icon-only" />
              </div>
              {lastUpdatedLabel && (
                <div className="absolute right-4 top-4 md:hidden">
                  <LastUpdatedBadge
                    lastUpdatedLabel={lastUpdatedLabel}
                    variant="icon-only"
                    isCheckingHash={isCheckingHash}
                    isFetchingCalendar={isFetchingCalendar}
                    hasError={hasError}
                  />
                </div>
              )}

              <div className="text-center">
                <div className="text-sm mb-1 text-muted-foreground">
                  {t("monthView.subtitle")}
                </div>
                <h2 className="text-2xl font-medium text-foreground capitalize">
                  {monthTitle}
                </h2>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2 absolute right-4 bottom-4">
                {lastUpdatedLabel && (
                  <LastUpdatedBadge
                    lastUpdatedLabel={lastUpdatedLabel}
                    variant="full"
                    isCheckingHash={isCheckingHash}
                    isFetchingCalendar={isFetchingCalendar}
                    hasError={hasError}
                  />
                )}
                <CalendarViewBadge variant="full" />
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-7xl mx-auto w-full px-4 pb-4">
            <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
              <div
                className="rounded-xl border overflow-auto"
                style={{
                  borderColor: "var(--color-border-alpha-30)",
                  backgroundColor: "var(--color-surface-alpha-20)",
                }}
              >
                <div className="min-w-[760px]">
                  <div
                    className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b"
                    style={{ borderColor: "var(--color-border-alpha-30)" }}
                  >
                    <div
                      className="p-2 text-[10px] font-semibold"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t("weekView.weekShort")}
                    </div>
                    {dayNames.map((dayName) => (
                      <div
                        key={dayName}
                        className="p-2 text-xs font-semibold border-l"
                        style={{
                          borderColor: "var(--color-border-alpha-30)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {monthData.weeks.map((week) => (
                    <div
                      key={week.id}
                      className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b last:border-b-0"
                      style={{ borderColor: "var(--color-border-alpha-30)" }}
                    >
                      <button
                        type="button"
                        className="px-2 py-3 text-[11px] font-semibold transition-opacity hover:opacity-80"
                        style={{ color: "var(--color-text-secondary)" }}
                        onClick={() => navigateToWeek(week.weekStart)}
                      >
                        {DateFormatUtils.getWeekNumber(week.weekStart)}
                      </button>
                      {week.days.map((day) => renderDayCell(day))}
                    </div>
                  ))}
                </div>
              </div>

              <aside className="space-y-3">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--color-border-alpha-30)",
                    backgroundColor: "var(--color-surface-alpha-20)",
                  }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {t("monthView.highlights")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {t("monthView.scheduledHours")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatHours(monthData.metrics.scheduledHours)}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {t("monthView.hidden")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatHours(monthData.metrics.hiddenHours)}h (
                        {Math.round(monthData.metrics.hiddenPercentage)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {t("monthView.gapHours")}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatHours(monthData.metrics.gapHours)}h
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: "var(--color-border-alpha-30)",
                    backgroundColor: "var(--color-surface-alpha-20)",
                  }}
                >
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {t("monthView.timeConsumption")}
                  </h3>

                  {monthData.metrics.realizations.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>{t("monthView.noEvents")}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {monthData.metrics.realizations
                        .slice(0, 12)
                        .map((item) => {
                          return (
                            <div key={item.key}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: item.color }}
                                  />
                                  <span className="text-xs text-foreground truncate">
                                    {item.label}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-foreground">
                                  {formatHours(item.hours)}h
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  },
);

MonthView.displayName = "MonthView";

export default MonthView;
