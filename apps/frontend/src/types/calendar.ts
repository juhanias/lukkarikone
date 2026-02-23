export interface Calendar {
  id: string;
  name: string;
  icalUrls: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CalendarState {
  calendars: Calendar[];
  activeCalendarId: string | null;

  // Calendar CRUD operations
  addCalendar: (name: string, icalUrls?: string[]) => string;
  updateCalendar: (
    id: string,
    updates: Partial<Omit<Calendar, "id" | "createdAt">>,
  ) => void;
  deleteCalendar: (id: string) => void;
  getCalendar: (id: string) => Calendar | undefined;
  getActiveCalendar: () => Calendar | undefined;
  setActiveCalendar: (id: string) => void;

  // iCal URL management within calendars
  addIcalUrl: (calendarId: string, url: string) => void;
  removeIcalUrl: (calendarId: string, url: string) => void;
  updateIcalUrl: (calendarId: string, oldUrl: string, newUrl: string) => void;
}
