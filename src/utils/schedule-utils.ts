import ICAL from 'ical.js';
import { format, isSameDay } from 'date-fns';
import type { TurkuAmkScheduleEntry, ScheduleEvent } from '../types/schedule';

export class ScheduleUtils {
  private static readonly BACKEND_API_BASE = 'https://lukkari-api.juh.fi/api';

  private static readonly EVENT_COLORS = [
    'bg-blue-800',
    'bg-purple-800', 
    'bg-green-800',
    'bg-orange-800',
    'bg-teal-800',
    'bg-indigo-800',
    'bg-red-800',
    'bg-amber-800',
    'bg-slate-600',
    'bg-gray-600',
    'bg-emerald-800',
    'bg-rose-800',
    'bg-cyan-800',
    'bg-violet-800',
    'bg-lime-800',
    'bg-sky-800',
  ];

  // Simple hash function to generate consistent colors based on event title
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  static getSeededColor(eventTitle: string): string {
    const hash = this.hashString(eventTitle);
    const colorIndex = hash % this.EVENT_COLORS.length;
    return this.EVENT_COLORS[colorIndex];
  }

  static async retrieveScheduleFromUrl(calendarUrl?: string): Promise<InstanceType<typeof ICAL.Component>> {
    try {
      if (!calendarUrl) {
        throw new Error('Calendar URL is required. Please configure your calendar URL in settings.');
      }

      // Use the backend API to fetch the calendar
      const apiUrl = `${this.BACKEND_API_BASE}/calendar?url=${encodeURIComponent(calendarUrl)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();
      const jcalData = ICAL.parse(data);
      const comp = new ICAL.Component(jcalData);
      return comp;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  static getEventsForDate(date: Date, calendar: InstanceType<typeof ICAL.Component>): InstanceType<typeof ICAL.Component>[] {
    const relevant: InstanceType<typeof ICAL.Component>[] = [];
    
    const vevents = calendar.getAllSubcomponents('vevent');
    
    vevents.forEach((vevent) => {
      const dtstart = vevent.getFirstProperty('dtstart');
      if (dtstart) {
        const startTime = dtstart.getFirstValue() as InstanceType<typeof ICAL.Time>;
        const eventDate = startTime.toJSDate();
        
        if (isSameDay(eventDate, date)) {
          relevant.push(vevent);
        }
      }
    });

    return relevant;
  }

  static getTurkuAmkMetadata(event: InstanceType<typeof ICAL.Component>): TurkuAmkScheduleEntry {
    const description = event.getFirstProperty('description')?.getFirstValue() as string || '';
    
    const peopleRegex = /Henkilö\(t\):\s*([^\n\r]*)/;
    const groupsRegex = /Ryhmä\(t\):\s*([^\n\r]*)/;

    const peopleMatch = peopleRegex.exec(description);
    const groupsMatch = groupsRegex.exec(description);

    const peopleText = peopleMatch ? peopleMatch[1] : '';
    const groupsText = groupsMatch ? groupsMatch[1] : '';

    const people = peopleText
      .split(/\\,/)
      .map(person => person.trim())
      .filter(person => person.length > 0);

    const groups = groupsText
      .split(/\\,/)
      .map(group => group.trim())
      .filter(group => group.length > 0);

    return {
      teachers: people,
      groups: groups,
    };
  }

  static convertToScheduleEvent(vevent: InstanceType<typeof ICAL.Component>, index: number): ScheduleEvent {
    const summary = vevent.getFirstProperty('summary')?.getFirstValue() as string || 'Untitled Event';
    const location = vevent.getFirstProperty('location')?.getFirstValue() as string || '';
    const description = vevent.getFirstProperty('description')?.getFirstValue() as string || '';
    const uid = vevent.getFirstProperty('uid')?.getFirstValue() as string || `event-${index}`;
    
    const dtstart = vevent.getFirstProperty('dtstart')?.getFirstValue() as InstanceType<typeof ICAL.Time>;
    const dtend = vevent.getFirstProperty('dtend')?.getFirstValue() as InstanceType<typeof ICAL.Time>;
    
    const startTime = dtstart.toJSDate();
    const endTime = dtend.toJSDate();
    
    // Calculate duration in hours
    const durationMs = endTime.getTime() - startTime.getTime();
    const duration = durationMs / (1000 * 60 * 60);
    
    // Calculate start hour for positioning (e.g., 8:30 AM = 8.5)
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    
    const metadata = this.getTurkuAmkMetadata(vevent);
    
    return {
      id: uid,
      title: summary,
      location: location,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      startHour: startHour,
      color: this.getSeededColor(summary), // Use seeded color based on event title
      teachers: metadata.teachers,
      groups: metadata.groups,
      description: description,
    };
  }

  static formatTimeRange(startTime: Date, endTime: Date): string {
    const startFormatted = format(startTime, 'HH:mm');
    const endFormatted = format(endTime, 'HH:mm');
    return `${startFormatted} - ${endFormatted}`;
  }
}
