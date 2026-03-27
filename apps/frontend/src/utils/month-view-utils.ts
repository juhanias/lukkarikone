import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { RealizationApiService } from "../services/realizationApi";
import type {
  EventMetadataMap,
  RealizationMetadataMap,
} from "../types/metadata";
import type { ScheduleEvent } from "../types/schedule";
import { ScheduleUtils } from "../utils/schedule-utils";

const DEFAULT_TARGET_HOURS_PER_DAY = 12;
export const MONTH_TIMELINE_START_HOUR = 8;
export const MONTH_TIMELINE_END_HOUR = 20;
const TIMELINE_SLOT_HOURS = 0.5;

export interface MonthTimelineSegment {
  id: string;
  eventId: string | null;
  startHour: number;
  endHour: number;
}

export interface MonthDayCellData {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  events: ScheduleEvent[];
  visibleEvents: ScheduleEvent[];
  totalHours: number;
  visibleHours: number;
  gapHours: number;
  timelineSegments: MonthTimelineSegment[];
}

export interface MonthWeekRowData {
  id: string;
  weekStart: Date;
  days: MonthDayCellData[];
  visibleHours: number;
}

export interface MonthRealizationSummary {
  key: string;
  label: string;
  color: string;
  hours: number;
}

export interface MonthMetrics {
  totalHours: number;
  scheduledHours: number;
  hiddenHours: number;
  hiddenPercentage: number;
  gapHours: number;
  availableHours: number;
  freeHours: number;
  baselineMode: "weekdays" | "all-days";
  realizations: MonthRealizationSummary[];
}

export interface MonthViewData {
  weeks: MonthWeekRowData[];
  metrics: MonthMetrics;
  currentMonthDays: MonthDayCellData[];
}

interface BuildMonthViewDataOptions {
  monthDate: Date;
  events: ScheduleEvent[];
  metadataByEvent: EventMetadataMap;
  metadataByRealization: RealizationMetadataMap;
  isEventHidden: (eventId: string) => boolean;
  isRealizationHidden: (realizationCode: string) => boolean;
  targetHoursPerDay?: number;
  timelineStartHour?: number;
  timelineEndHour?: number;
}

const getDateKey = (date: Date) => date.toDateString();

const getEventHours = (events: ScheduleEvent[]) =>
  events.reduce((total, event) => total + event.duration, 0);

const calculateDayGapHours = (events: ScheduleEvent[]): number => {
  if (events.length < 2) {
    return 0;
  }

  const sorted = events
    .slice()
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  let gaps = 0;
  for (let index = 0; index < sorted.length - 1; index++) {
    const current = sorted[index];
    const next = sorted[index + 1];
    const currentEnd = current.startHour + current.duration;
    const gap = next.startHour - currentEnd;
    if (gap > 0) {
      gaps += gap;
    }
  }

  return gaps;
};

const buildTimelineSegments = (
  events: ScheduleEvent[],
  timelineStartHour: number,
  timelineEndHour: number,
): MonthTimelineSegment[] => {
  const range = Math.max(1, timelineEndHour - timelineStartHour);
  const slotCount = Math.ceil(range / TIMELINE_SLOT_HOURS);
  const sorted = events
    .slice()
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const slotEventIds: Array<string | null> = [];

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
    const slotStart = timelineStartHour + slotIndex * TIMELINE_SLOT_HOURS;
    const slotEnd = Math.min(timelineEndHour, slotStart + TIMELINE_SLOT_HOURS);

    const matchingEvent = sorted.find((event) => {
      const eventStart = event.startHour;
      const eventEnd = event.startHour + event.duration;
      return eventStart < slotEnd && eventEnd > slotStart;
    });

    slotEventIds.push(matchingEvent?.id ?? null);
  }

  const segments: MonthTimelineSegment[] = [];
  if (slotEventIds.length === 0) {
    return segments;
  }

  let segmentStart = 0;
  let currentEventId = slotEventIds[0];

  for (let slotIndex = 1; slotIndex <= slotEventIds.length; slotIndex++) {
    const nextEventId =
      slotIndex < slotEventIds.length ? slotEventIds[slotIndex] : null;
    if (slotIndex === slotEventIds.length || nextEventId !== currentEventId) {
      segments.push({
        id: `${segmentStart}-${slotIndex}-${currentEventId ?? "empty"}`,
        eventId: currentEventId,
        startHour: timelineStartHour + segmentStart * TIMELINE_SLOT_HOURS,
        endHour: timelineStartHour + slotIndex * TIMELINE_SLOT_HOURS,
      });

      segmentStart = slotIndex;
      currentEventId = nextEventId;
    }
  }

  return segments;
};

export const buildMonthViewData = ({
  monthDate,
  events,
  metadataByEvent,
  metadataByRealization,
  isEventHidden,
  isRealizationHidden,
  targetHoursPerDay = DEFAULT_TARGET_HOURS_PER_DAY,
  timelineStartHour = MONTH_TIMELINE_START_HOUR,
  timelineEndHour = MONTH_TIMELINE_END_HOUR,
}: BuildMonthViewDataOptions): MonthViewData => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const allDates = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const eventsByDate: Record<string, ScheduleEvent[]> = {};

  events.forEach((event) => {
    const key = getDateKey(event.startTime);
    if (!eventsByDate[key]) {
      eventsByDate[key] = [];
    }
    eventsByDate[key].push(event);
  });

  const allDayCells: MonthDayCellData[] = allDates.map((date) => {
    const dateKey = getDateKey(date);
    const dayEvents = eventsByDate[dateKey] || [];
    const visibleEvents = dayEvents.filter((event) => {
      const hiddenOverride = metadataByEvent[event.id]?.hidden;
      if (typeof hiddenOverride === "boolean") {
        return !hiddenOverride;
      }

      if (isEventHidden(event.id)) {
        return false;
      }

      const attachedRealizationId =
        metadataByEvent[event.id]?.attachedRealizationId ?? null;
      const realizationCode = RealizationApiService.getEffectiveRealizationCode(
        event.title,
        attachedRealizationId,
      );

      if (!realizationCode) {
        return true;
      }

      return !isRealizationHidden(realizationCode);
    });

    const timelineSegments = buildTimelineSegments(
      visibleEvents,
      timelineStartHour,
      timelineEndHour,
    );
    const gapHours = calculateDayGapHours(visibleEvents);

    return {
      date,
      dateKey,
      inCurrentMonth: isSameMonth(date, monthDate),
      events: dayEvents,
      visibleEvents,
      totalHours: getEventHours(dayEvents),
      visibleHours: getEventHours(visibleEvents),
      gapHours,
      timelineSegments,
    };
  });

  const weeks: MonthWeekRowData[] = [];
  for (let index = 0; index < allDayCells.length; index += 7) {
    const days = allDayCells.slice(index, index + 7);
    const weekStart = days[0]?.date ?? monthStart;
    const visibleHours = days.reduce((total, day) => {
      if (!day.inCurrentMonth) {
        return total;
      }
      return total + day.visibleHours;
    }, 0);

    weeks.push({
      id: `week-${weekStart.toISOString()}`,
      weekStart,
      days,
      visibleHours,
    });
  }

  const currentMonthDays = allDayCells.filter((day) => day.inCurrentMonth);
  const totalHours = currentMonthDays.reduce(
    (total, day) => total + day.totalHours,
    0,
  );
  const scheduledHours = currentMonthDays.reduce(
    (total, day) => total + day.visibleHours,
    0,
  );
  const hiddenHours = Math.max(totalHours - scheduledHours, 0);
  const hiddenPercentage =
    totalHours > 0 ? (hiddenHours / totalHours) * 100 : 0;
  const gapHours = currentMonthDays.reduce(
    (total, day) => total + day.gapHours,
    0,
  );

  const hasWeekendEventsInMonth = currentMonthDays.some(
    (day) => isWeekend(day.date) && day.visibleHours > 0,
  );
  const baselineMode: "weekdays" | "all-days" = hasWeekendEventsInMonth
    ? "all-days"
    : "weekdays";

  const baselineDays =
    baselineMode === "all-days"
      ? currentMonthDays.length
      : currentMonthDays.filter((day) => !isWeekend(day.date)).length;

  const availableHours = baselineDays * targetHoursPerDay;
  const freeHours = Math.max(availableHours - scheduledHours, 0);

  const realizationsByKey = new Map<
    string,
    {
      key: string;
      label: string;
      color: string;
      hours: number;
    }
  >();

  currentMonthDays.forEach((day) => {
    day.visibleEvents.forEach((event) => {
      const attachedRealizationId =
        metadataByEvent[event.id]?.attachedRealizationId ?? null;
      const realizationCode = RealizationApiService.getEffectiveRealizationCode(
        event.title,
        attachedRealizationId,
      );
      const strippedTitle = RealizationApiService.stripRealizationCode(
        event.title,
      );
      const key = realizationCode || strippedTitle.toLowerCase();
      const colorPair = ScheduleUtils.getColorPair(
        event.title,
        event.id,
        metadataByEvent,
        metadataByRealization,
      );

      const existing = realizationsByKey.get(key);
      if (existing) {
        existing.hours += event.duration;
        return;
      }

      realizationsByKey.set(key, {
        key,
        label: realizationCode ? realizationCode.toUpperCase() : strippedTitle,
        color: colorPair.normal,
        hours: event.duration,
      });
    });
  });

  const realizations = Array.from(realizationsByKey.values())
    .sort((a, b) => b.hours - a.hours)
    .map((item) => ({
      key: item.key,
      label: item.label,
      color: item.color,
      hours: item.hours,
    }));

  return {
    weeks,
    metrics: {
      totalHours,
      scheduledHours,
      hiddenHours,
      hiddenPercentage,
      gapHours,
      availableHours,
      freeHours,
      baselineMode,
      realizations,
    },
    currentMonthDays,
  };
};
