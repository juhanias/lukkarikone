import { Calendar, Clock, Eye, EyeOff, Palette, Pencil } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DAY_HOUR_HEIGHT,
  START_HOUR,
} from "../../constants/schedule-layout-constants";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { useLectureDetailsDialog } from "../../hooks/useLectureDetailsDialog";
import { useRealizationDialog } from "../../hooks/useRealizationDialog";
import { useColorCustomizerDialogParam } from "../../hooks/useDialogParams";
import { RealizationApiService } from "../../services/realizationApi";
import {
  default as useConfigStore,
  useEventMetadataStore,
  useRealizationMetadataStore,
} from "../../state/state-management";
import type { GapPeriod, ScheduleEvent } from "../../types/schedule";
import { DateFormatUtils } from "../../utils/date-format-utils";
import {
  type PositionedEvent,
  ScheduleLayoutUtils,
} from "../../utils/schedule-layout-utils";
import { ScheduleUtils } from "../../utils/schedule-utils";
import { CalendarViewBadge } from "../CalendarViewBadge";
import { LastUpdatedBadge } from "../LastUpdatedBadge";
import LectureDetailsDialog from "../LectureDetailsDialog";
import { RealizationColorCustomizer } from "@/components/RealizationColorCustomizer";
import RealizationDialog from "../RealizationDialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";

interface ScheduleDayProps {
  date: Date;
  events: ScheduleEvent[];
  lastUpdatedLabel?: string | null;
  isCheckingHash?: boolean;
  isFetchingCalendar?: boolean;
  hasError?: boolean;
}

const ScheduleDay = memo(
  ({
    date,
    events,
    lastUpdatedLabel,
    isCheckingHash,
    isFetchingCalendar,
    hasError,
  }: ScheduleDayProps) => {
    const { t } = useTranslation("schedule");
    const { t: tColor } = useTranslation("colorCustomization");

    const [colorEventId, setColorEventId] = useColorCustomizerDialogParam();

    // Realization color store
    const { metadataByRealization, isRealizationHidden } =
      useRealizationMetadataStore();

    // Event metadata store
    const { metadataByEvent, isEventHidden, setEventHidden } =
      useEventMetadataStore();

    // Config store for opacity setting
    const { config } = useConfigStore();

    const getDisplayTitle = (title: string) =>
      config.showCourseIdInSchedule
        ? title
        : RealizationApiService.stripRealizationCode(title);

    // Realization dialog hook
    const {
      isOpen: realizationDialogOpen,
      isLoading: realizationLoading,
      error: realizationError,
      realizationData,
      openDialog: openRealizationDialog,
      openDialogByCode: openRealizationDialogByCode,
      closeDialog: closeRealizationDialog,
    } = useRealizationDialog();

    // Lecture details dialog hook
    const {
      isOpen: lectureDetailsDialogOpen,
      selectedEvent,
      openDialog: openLectureDetailsDialog,
      closeDialog: closeLectureDetailsDialog,
    } = useLectureDetailsDialog();

    // Helper function to open color customizer for an event
    const openColorCustomizer = (event: ScheduleEvent) => {
      setColorEventId(event.id);
    };

    // Function to calculate gap periods between events
    const calculateGapPeriods = (events: ScheduleEvent[]): GapPeriod[] => {
      return ScheduleLayoutUtils.calculateGapPeriods(events);
    };

    // Function to calculate positions for overlapping events
    const calculateEventPositions = (
      events: ScheduleEvent[],
    ): PositionedEvent[] => {
      return ScheduleLayoutUtils.calculateEventPositions(events);
    };

    // Generate dynamic time slots
    const generateTimeSlots = (events: ScheduleEvent[]): string[] => {
      return ScheduleLayoutUtils.generateTimeSlots(events);
    };

    const eventsById = useMemo(
      () => new Map(events.map((event) => [event.id, event])),
      [events],
    );
    const selectedEventForColor = colorEventId
      ? eventsById.get(colorEventId) ?? null
      : null;

    useEffect(() => {
      if (colorEventId && !selectedEventForColor) {
        setColorEventId(null);
      }
    }, [colorEventId, selectedEventForColor, setColorEventId]);
    const isEventEffectivelyHidden = useMemo(
      () => (eventId: string) => {
        const event = eventsById.get(eventId);
        const override = metadataByEvent[eventId]?.hidden;
        if (typeof override === "boolean") {
          return override;
        }
        if (!event) {
          return isEventHidden(eventId);
        }
        const attachedRealizationId =
          metadataByEvent[eventId]?.attachedRealizationId ?? null;
        const realizationCode =
          RealizationApiService.getEffectiveRealizationCode(
            event.title,
            attachedRealizationId,
          );
        return Boolean(realizationCode && isRealizationHidden(realizationCode));
      },
      [eventsById, metadataByEvent, isEventHidden, isRealizationHidden],
    );

    const toggleEventVisibility = (event: ScheduleEvent) => {
      const nextHidden = !isEventEffectivelyHidden(event.id);
      setEventHidden(event.id, nextHidden);
    };

    const hasTimeOverrideChange = (event: ScheduleEvent) => {
      const override = metadataByEvent[event.id]?.overrides?.time;
      if (!override) {
        return false;
      }
      const originalStart = new Date(override.originalStartTimeIso);
      const originalEnd = new Date(override.originalEndTimeIso);
      return (
        event.startTime.getTime() !== originalStart.getTime() ||
        event.endTime.getTime() !== originalEnd.getTime()
      );
    };

    const formatDate = (date: Date, events: ScheduleEvent[]) => {
      return DateFormatUtils.formatDayViewDate(
        date,
        events,
        isEventEffectivelyHidden,
        config.showTotalHours,
      );
    };

    const positionedEvents = calculateEventPositions(events);
    const gapPeriods = calculateGapPeriods(events);
    const timeSlots = generateTimeSlots(events);
    const dateInfo = formatDate(date, events);

    // Current time indicator
    const currentTime = useCurrentTime();
    const isToday = DateFormatUtils.isToday(date);
    const currentTimeInHours =
      DateFormatUtils.getCurrentTimeInHours(currentTime);
    const currentTimeString = DateFormatUtils.getCurrentTimeString(currentTime);
    const showCurrentTimeIndicator =
      isToday &&
      currentTimeInHours >= START_HOUR &&
      currentTimeInHours <= START_HOUR + timeSlots.length;
    const currentTimePosition = showCurrentTimeIndicator
      ? (currentTimeInHours - START_HOUR) * DAY_HOUR_HEIGHT
      : 0;

    return (
      <div className="w-full h-full flex flex-col">
        {/* Date Header - Full Width Gradient */}
        <div
          className="w-full flex-shrink-0"
          style={{
            background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 text-center relative">
            {/* Mobile Icon Buttons - Top corners */}
            <div className="absolute left-4 top-4 md:hidden flex gap-2">
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
            <div
              className="text-sm mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {dateInfo.dayWeek}
            </div>
            <h2
              className="text-2xl font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {dateInfo.fullDate}
            </h2>
            {/* Desktop badges - Stacked vertically, right-aligned */}
            <div className="hidden md:flex flex-col items-end gap-2 mt-3">
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

        {/* Schedule Container */}
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          <div className="flex-1 flex flex-col px-4">
            {events.length === 0 ? (
              <div
                className="flex-1 flex flex-col items-center justify-center min-h-96"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Calendar size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">{t("dayView.noEvents")}</p>
                <p className="text-sm opacity-75 mt-1 text-center">
                  {t("dayView.noEventsDescription")}
                </p>

                {/* decorative elements for empty state */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center space-x-2 text-xs opacity-60">
                    <span>←</span>
                    <span>{t("dayView.swipeToNavigate")}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 relative">
                {/* Time Grid - Compact Mobile Version */}
                <div className="space-y-0">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className="relative border-b last:border-b-0"
                      style={{
                        height: `${DAY_HOUR_HEIGHT}px`,
                        borderColor: "var(--color-border-alpha-30)",
                      }}
                    >
                      <div
                        className="absolute left-0 top-2 w-14 text-xs font-medium"
                        style={{
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {time}
                      </div>
                      <div className="ml-16 h-full relative">
                        {index < timeSlots.length - 1 && (
                          <div
                            className="absolute left-0 top-0 bottom-0 border-l"
                            style={{
                              borderColor: "var(--color-border-alpha-30)",
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Events Overlay */}
                <div className="absolute inset-0 ml-16">
                  {/* Current Time Indicator */}
                  {showCurrentTimeIndicator && (
                    <div
                      className="absolute z-20"
                      style={{
                        top: `${currentTimePosition}px`,
                        left: "-4rem", // Extend to include time column
                        right: "-1rem", // Extend to the edge
                        width: "calc(100% + 5rem)", // Ensure full width coverage
                      }}
                    >
                      {/* Time label */}
                      <div
                        className="absolute left-0 top-0 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center gap-1"
                        style={{ textShadow: "none" }}
                      >
                        <Clock size={12} />
                        {currentTimeString}
                      </div>
                      {/* Line */}
                      <div
                        className="absolute left-14 top-0 h-0.5 bg-red-500 shadow-sm"
                        style={{ right: "1rem" }}
                      ></div>
                    </div>
                  )}

                  {/* Gap Periods */}
                  {gapPeriods.map((gap) => (
                    <div
                      key={gap.id}
                      className="absolute flex items-center justify-center text-xs"
                      style={{
                        top: `${(gap.startHour - START_HOUR) * DAY_HOUR_HEIGHT}px`,
                        height: `${gap.duration * DAY_HOUR_HEIGHT}px`,
                        width: "100%",
                        left: "0%",
                        zIndex: 0,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <div
                        className="px-2 py-1 rounded text-xs border"
                        style={{
                          backgroundColor: "var(--color-surface-alpha-40)",
                          borderColor: "var(--color-border-alpha-30)",
                        }}
                      >
                        {gap.duration.toFixed(1)}h {t("dayView.breakDuration")}
                      </div>
                    </div>
                  ))}

                  {/* Events */}
                  {positionedEvents.map((event) => {
                    const eventDurationInHours =
                      (event.endTime.getTime() - event.startTime.getTime()) /
                      (1000 * 60 * 60);
                    const colorPair = ScheduleUtils.getColorPair(
                      event.title,
                      event.id,
                      metadataByEvent,
                      metadataByRealization,
                    );
                    const isHidden = isEventEffectivelyHidden(event.id);

                    return (
                      <ContextMenu key={event.id}>
                        <ContextMenuTrigger asChild>
                          <button
                            type="button"
                            className={`absolute rounded-lg text-white shadow-lg cursor-pointer overflow-hidden transition-colors duration-200 schedule-event-gradient border-none p-0 text-left appearance-none flex flex-col items-start justify-start`}
                            style={
                              {
                                top: `${(event.startHour - START_HOUR) * DAY_HOUR_HEIGHT}px`,
                                height: `${event.duration * DAY_HOUR_HEIGHT}px`,
                                width: `${event.width}%`,
                                left: `${event.left}%`,
                                zIndex: event.zIndex,
                                marginLeft: "2px",
                                marginRight: "2px",
                                background: colorPair.normal,
                                opacity: isHidden
                                  ? config.hiddenEventOpacity / 100
                                  : 1,
                                "--normal-gradient": colorPair.normal,
                                "--hover-gradient": colorPair.flipped,
                              } as React.CSSProperties & {
                                "--normal-gradient": string;
                                "--hover-gradient": string;
                              }
                            }
                            onClick={() => {
                              // Open lecture details dialog for this event
                              openLectureDetailsDialog(event);
                            }}
                          >
                            {/* Event Time Badge */}
                            <div className="bg-black/20 px-2 py-1 text-xs font-medium">
                              {ScheduleUtils.formatTimeRange(
                                event.startTime,
                                event.endTime,
                              )}
                            </div>

                            {/* Event Content */}
                            <div className="p-3 space-y-2">
                              <h3
                                className={`font-bold leading-tight ${
                                  eventDurationInHours < 1.5
                                    ? "text-sm line-clamp-2"
                                    : "text-base line-clamp-3"
                                }`}
                              >
                                {getDisplayTitle(event.title)}
                              </h3>

                              {event.location && eventDurationInHours >= 1.5 && (
                                <p
                                  className={`text-xs opacity-90 leading-tight ${
                                    eventDurationInHours >= 3
                                      ? "line-clamp-3"
                                      : "line-clamp-2"
                                  }`}
                                >
                                  {event.location}
                                </p>
                              )}

                              {event.teachers &&
                                event.teachers.length > 0 &&
                                eventDurationInHours >= 2 && (
                                  <p className="text-xs opacity-75 line-clamp-2">
                                    {event.teachers.join(", ")}
                                  </p>
                                )}
                            </div>

                            {/* Footer notes */}
                            {hasTimeOverrideChange(event) && (
                              <div className="absolute bottom-1 right-1 flex items-center gap-1 text-white/80 pointer-events-none">
                                <Pencil className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent
                          style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                        >
                          <ContextMenuItem
                            onClick={() => openLectureDetailsDialog(event)}
                            style={{ color: "var(--color-text)" }}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {tColor("contextMenu.eventDetails")}
                          </ContextMenuItem>
                          <ContextMenuSeparator
                            style={{ backgroundColor: "var(--color-border)" }}
                          />
                          <ContextMenuItem
                            onClick={() => toggleEventVisibility(event)}
                            style={{ color: "var(--color-text)" }}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                {tColor("contextMenu.showEvent")}
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                {tColor("contextMenu.hideEvent")}
                              </>
                            )}
                          </ContextMenuItem>
                          <ContextMenuSeparator
                            style={{
                              backgroundColor: "var(--color-border)",
                            }}
                          />
                          <ContextMenuItem
                            onClick={() => openColorCustomizer(event)}
                            style={{ color: "var(--color-text)" }}
                          >
                            <Palette className="mr-2 h-4 w-4" />
                            {tColor("contextMenu.customizeColor")}
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Realization Dialog */}
        <RealizationDialog
          open={realizationDialogOpen}
          onOpenChange={closeRealizationDialog}
          realizationData={realizationData}
          isLoading={realizationLoading}
          error={realizationError}
        />

        {/* Lecture Details Dialog */}
        <LectureDetailsDialog
          open={lectureDetailsDialogOpen}
          onOpenChange={closeLectureDetailsDialog}
          event={selectedEvent}
          onOpenRealizationDialog={openRealizationDialog}
          onOpenRealizationDialogByCode={openRealizationDialogByCode}
          isRealizationLoading={realizationLoading}
        />

        {/* Color Customizer Dialog */}
        {selectedEventForColor && (
          <RealizationColorCustomizer
            open={Boolean(colorEventId)}
            onOpenChange={(isOpen: boolean) => {
              if (!isOpen) {
                setColorEventId(null);
              }
            }}
            eventId={selectedEventForColor.id}
            eventTitle={getDisplayTitle(selectedEventForColor.title)}
            eventTitleRaw={selectedEventForColor.title}
            realizationCode={
              metadataByEvent[selectedEventForColor.id]
                ?.attachedRealizationId ||
              RealizationApiService.extractRealizationCode(
                selectedEventForColor.title,
              ) ||
              ""
            }
            realizationTitle={RealizationApiService.stripRealizationCode(
              selectedEventForColor.title,
            )}
          />
        )}
      </div>
    );
  },
);

ScheduleDay.displayName = "ScheduleDay";

export default ScheduleDay;
