import { START_HOUR } from "../constants/schedule-layout-constants";
import type { GapPeriod, ScheduleEvent } from "../types/schedule";

export interface PositionedEvent extends ScheduleEvent {
  width: number;
  left: number;
  zIndex: number;
  col: number;
  cols: number;
}

export class ScheduleLayoutUtils {
  /**
   * Calculates gap periods between events in a day
   */
  static calculateGapPeriods(events: ScheduleEvent[]): GapPeriod[] {
    if (events.length < 2) return [];

    const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour);
    const gaps: GapPeriod[] = [];

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];

      const currentEventEnd = currentEvent.startHour + currentEvent.duration;
      const gapDuration = nextEvent.startHour - currentEventEnd;

      // Only create gap if it's more than 1 hour
      if (gapDuration > 1) {
        gaps.push({
          id: `gap-${currentEvent.id}-${nextEvent.id}`,
          startHour: currentEventEnd,
          duration: gapDuration,
        });
      }
    }

    return gaps;
  }

  /**
   * Checks if two events overlap in time
   */
  static eventsOverlap(event1: ScheduleEvent, event2: ScheduleEvent): boolean {
    const end1 = event1.startHour + event1.duration;
    const end2 = event2.startHour + event2.duration;
    return event1.startHour < end2 && event2.startHour < end1;
  }

  /**
   * Calculates horizontal placement for day/week event blocks
   *
   * - Provide a base layout that views can tweak (for hidden/visible rules)
   * - Group overlapping events
   * - Convert columns to `left` and `width` percentages
   *
   * Returned `col`/`cols` are intentionally exposed so views can apply
   * additional policies on top of this baseline layout (for example hidden
   * events occupying less width when overlapping visible events)
   */
  static calculateEventPositions(events: ScheduleEvent[]): PositionedEvent[] {
    const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour);
    const clusters: ScheduleEvent[][] = [];
    let currentCluster: ScheduleEvent[] = [];
    let clusterEnd = -Infinity;

    // Separate overlap groups so independent time blocks do not affect each other
    sortedEvents.forEach((event) => {
      const eventEnd = event.startHour + event.duration;
      if (currentCluster.length === 0) {
        currentCluster.push(event);
        clusterEnd = eventEnd;
      } else if (event.startHour < clusterEnd) {
        currentCluster.push(event);
        clusterEnd = Math.max(clusterEnd, eventEnd);
      } else {
        clusters.push(currentCluster);
        currentCluster = [event];
        clusterEnd = eventEnd;
      }
    });

    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    const positionedEvents: PositionedEvent[] = [];

    clusters.forEach((cluster) => {
      // Track when each column becomes free.
      const columnEnds: number[] = [];
      const assigned = new Map<
        string,
        { event: ScheduleEvent; col: number; cols: number }
      >();

      cluster.forEach((event) => {
        const eventEnd = event.startHour + event.duration;
        let assignedCol = -1;

        // Reuse a free column first; create a new one only if needed
        for (let i = 0; i < columnEnds.length; i++) {
          if (event.startHour >= columnEnds[i]) {
            assignedCol = i;
            columnEnds[i] = eventEnd;
            break;
          }
        }

        if (assignedCol === -1) {
          assignedCol = columnEnds.length;
          columnEnds.push(eventEnd);
        }

        assigned.set(event.id, { event, col: assignedCol, cols: 0 });
      });

      // All events in the cluster share the same base column count
      const totalCols = Math.max(1, columnEnds.length);
      for (const value of assigned.values()) {
        value.cols = totalCols;
      }

      for (const value of assigned.values()) {
        const width = 100 / value.cols;
        const left = (value.col / value.cols) * 100;
        const zIndex = value.col + 1;

        positionedEvents.push({
          ...value.event,
          width,
          left,
          zIndex,
          col: value.col,
          cols: value.cols,
        });
      }
    });

    return positionedEvents.sort((a, b) => a.startHour - b.startHour);
  }

  /**
   * Generates dynamic time slots based on events for day view
   */
  static generateTimeSlots(events: ScheduleEvent[]): string[] {
    const MIN_END_HOUR = 16;

    let maxEndHour = MIN_END_HOUR;

    // Find the latest end time from all events
    if (events.length > 0) {
      events.forEach((event) => {
        const eventEndHour = Math.ceil(event.startHour + event.duration);
        if (eventEndHour > maxEndHour) {
          maxEndHour = eventEndHour;
        }
      });
    }

    // Generate time slots from START_HOUR to the calculated end hour
    const slots: string[] = [];
    for (let hour = START_HOUR; hour <= maxEndHour; hour++) {
      slots.push(`${hour}:00`);
    }

    return slots;
  }

  /**
   * Generates dynamic time slots for week view based on events
   */
  static generateWeekTimeSlots(
    weekEvents: Record<string, ScheduleEvent[]>,
  ): string[] {
    const MIN_END_HOUR = 16;

    let maxEndHour = MIN_END_HOUR;

    // Find the latest end time from all events this week
    Object.values(weekEvents).forEach((dayEvents) => {
      dayEvents.forEach((event) => {
        const eventEndHour = Math.ceil(event.startHour + event.duration);
        if (eventEndHour > maxEndHour) {
          maxEndHour = eventEndHour;
        }
      });
    });

    const slots: string[] = [];
    for (let hour = START_HOUR; hour <= maxEndHour; hour++) {
      slots.push(`${hour}:00`);
    }

    return slots;
  }
}
