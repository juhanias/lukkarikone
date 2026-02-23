export interface TurkuAmkScheduleEntry {
  teachers: string[];
  groups: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  location: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  startHour: number; // for positioning (8:00 = 8, 8:30 = 8.5)
  color: string;
  teachers?: string[];
  groups?: string[];
  description?: string;
}

export interface GapPeriod {
  id: string;
  startHour: number;
  duration: number; // in hours
}
