export const SCHEDULE_LAYOUT = {
  START_HOUR: 8, // Start hour for schedule (8:00 AM)

  DAY_VIEW: {
    HOUR_HEIGHT: 80, // Height in pixels for each hour in day view
    TIME_SLOT_HEIGHT: 20, // Height for time slot containers (h-20 = 80px)
  },

  WEEK_VIEW: {
    HOUR_HEIGHT: 60, // Height in pixels for each hour in week view
    MIN_SLOT_HEIGHT: 60, // Minimum height for time slots in week view
  },

  EVENT: {
    MIN_HEIGHT: 20, // Minimum height for events in pixels
  },
} as const;

export const START_HOUR = SCHEDULE_LAYOUT.START_HOUR;
export const DAY_HOUR_HEIGHT = SCHEDULE_LAYOUT.DAY_VIEW.HOUR_HEIGHT;
export const WEEK_HOUR_HEIGHT = SCHEDULE_LAYOUT.WEEK_VIEW.HOUR_HEIGHT;
