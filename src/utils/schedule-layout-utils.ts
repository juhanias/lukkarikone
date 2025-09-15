import type { ScheduleEvent, GapPeriod } from '../types/schedule'
import { START_HOUR } from '../constants/schedule-layout-constants'

export interface PositionedEvent extends ScheduleEvent {
  width: number
  left: number
  zIndex: number
}

export class ScheduleLayoutUtils {
  /**
   * Calculates gap periods between events in a day
   */
  static calculateGapPeriods(events: ScheduleEvent[]): GapPeriod[] {
    if (events.length < 2) return []
    
    const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour)
    const gaps: GapPeriod[] = []
    
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i]
      const nextEvent = sortedEvents[i + 1]
      
      const currentEventEnd = currentEvent.startHour + currentEvent.duration
      const gapDuration = nextEvent.startHour - currentEventEnd
      
      // Only create gap if it's more than 1 hour
      if (gapDuration > 1) {
        gaps.push({
          id: `gap-${currentEvent.id}-${nextEvent.id}`,
          startHour: currentEventEnd,
          duration: gapDuration
        })
      }
    }
    
    return gaps
  }

  /**
   * Checks if two events overlap in time
   */
  static eventsOverlap(event1: ScheduleEvent, event2: ScheduleEvent): boolean {
    const end1 = event1.startHour + event1.duration
    const end2 = event2.startHour + event2.duration
    return event1.startHour < end2 && event2.startHour < end1
  }

  /**
   * Calculates positions for overlapping events in the day view
   */
  static calculateEventPositions(events: ScheduleEvent[]): PositionedEvent[] {
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour)
    
    // Group overlapping events using a more comprehensive approach
    const groups: ScheduleEvent[][] = []
    
    sortedEvents.forEach(event => {
      // Find the first group this event overlaps with
      const overlappingGroupIndex = groups.findIndex(group =>
        group.some(groupEvent => this.eventsOverlap(event, groupEvent))
      )
      
      if (overlappingGroupIndex !== -1) {
        // Add to existing group
        groups[overlappingGroupIndex].push(event)
      } else {
        // Create new group
        groups.push([event])
      }
    })

    // Calculate positions for each group
    const positionedEvents: PositionedEvent[] = []

    groups.forEach(group => {
      if (group.length === 1) {
        // No overlapping, full width
        positionedEvents.push({
          ...group[0],
          width: 100,
          left: 0,
          zIndex: 1
        })
      } else {
        // Overlapping events - each takes 50% width and stacks
        // Sort group by start time for consistent positioning
        const sortedGroup = group.sort((a, b) => a.startHour - b.startHour)
        
        sortedGroup.forEach((event, index) => {
          positionedEvents.push({
            ...event,
            width: 50,
            left: Math.min(index * 30, 50), // Offset each event, max 50% to stay within bounds
            zIndex: index + 2 // Higher z-index for events on top, starting from 2
          })
        })
      }
    })

    return positionedEvents
  }

  /**
   * Generates dynamic time slots based on events for day view
   */
  static generateTimeSlots(events: ScheduleEvent[]): string[] {
    const MIN_END_HOUR = 16
    
    let maxEndHour = MIN_END_HOUR
    
    // Find the latest end time from all events
    if (events.length > 0) {
      events.forEach(event => {
        const eventEndHour = Math.ceil(event.startHour + event.duration)
        if (eventEndHour > maxEndHour) {
          maxEndHour = eventEndHour
        }
      })
    }
    
    // Generate time slots from START_HOUR to the calculated end hour
    const slots: string[] = []
    for (let hour = START_HOUR; hour <= maxEndHour; hour++) {
      slots.push(`${hour}:00`)
    }
    
    return slots
  }

  /**
   * Generates dynamic time slots for week view based on events
   */
  static generateWeekTimeSlots(weekEvents: Record<string, ScheduleEvent[]>): string[] {
    const MIN_END_HOUR = 16
    
    let maxEndHour = MIN_END_HOUR
    
    // Find the latest end time from all events this week
    Object.values(weekEvents).forEach(dayEvents => {
      dayEvents.forEach(event => {
        const eventEndHour = Math.ceil(event.startHour + event.duration)
        if (eventEndHour > maxEndHour) {
          maxEndHour = eventEndHour
        }
      })
    })
    
    const slots: string[] = []
    for (let hour = START_HOUR; hour <= maxEndHour; hour++) {
      slots.push(`${hour}:00`)
    }
    
    return slots
  }
}
