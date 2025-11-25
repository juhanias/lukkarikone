import ICAL from 'ical.js';
import { format, isSameDay } from 'date-fns';
import type { TurkuAmkScheduleEntry, ScheduleEvent } from '../types/schedule';
import { RealizationApiService } from '../services/realizationApi';
import { API_CONFIG } from '../config/api';

export class ScheduleUtils {
  private static readonly BACKEND_API_BASE = API_CONFIG.BASE_URL;

  /**
   * Check calendar hash to see if the calendar has been updated
   */
  static async checkCalendarHash(calendarUrl: string): Promise<{
    hash: string;
    cached: boolean;
    cachedAt: string | null;
  }> {
    const apiUrl = `${this.BACKEND_API_BASE}/calendar/hash?url=${encodeURIComponent(calendarUrl)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const { hash, cached, cachedAt } = await response.json();
    return { hash, cached, cachedAt };
  }

  private static readonly EVENT_COLORS = [
    'rgb(30, 64, 175)', // blue
    'rgb(88, 28, 135)', // purple
    'rgb(22, 101, 52)', // green
    'rgb(194, 65, 12)', // orange
    'rgb(13, 148, 136)', // teal
    'rgb(67, 56, 202)', // indigo
    'rgb(185, 28, 28)', // red
    'rgb(180, 83, 9)', // amber
    'rgb(71, 85, 105)', // slate
    'rgb(75, 85, 99)', // gray
    'rgb(5, 150, 105)', // emerald
    'rgb(190, 18, 60)', // rose
    'rgb(8, 145, 178)', // cyan
    'rgb(124, 58, 237)', // violet
    'rgb(101, 163, 13)', // lime
    'rgb(7, 89, 133)', // sky
  ];

  // Utility function to lighten an RGB color by a given factor (0-1)
  static lightenRgbColor(rgbString: string, factor: number = 0.1): string {
    const rgbMatch = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return rgbString;
    
    const [, r, g, b] = rgbMatch.map(Number);
    
    // Lighten by mixing with white
    const lightenedR = Math.round(r + (255 - r) * factor);
    const lightenedG = Math.round(g + (255 - g) * factor);
    const lightenedB = Math.round(b + (255 - b) * factor);
    
    return `rgb(${lightenedR}, ${lightenedG}, ${lightenedB})`;
  }

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

  // Get the key to use for color generation - prioritize course ID if available
  private static getColorKey(eventTitle: string): string {
    const courseId = RealizationApiService.extractRealizationCode(eventTitle);
    return courseId || eventTitle;
  }

  /**
   * Gets the default color for a realization code (without custom overrides)
   * This method generates the same color that would be used in the original system
   */
  static getDefaultRealizationColor(realizationKey: string): string {
    const hash = this.hashString(realizationKey);
    const colorIndex = hash % this.EVENT_COLORS.length;
    return this.EVENT_COLORS[colorIndex];
  }

  /**
   * Gets the default color pair for a realization (without custom overrides)
   */
  static getDefaultColorPair(realizationKey: string): { normal: string; flipped: string } {
    const hash = this.hashString(realizationKey);
    const colorIndex = hash % this.EVENT_COLORS.length;
    const primaryColor = this.EVENT_COLORS[colorIndex];
    const secondaryColor = this.lightenRgbColor(primaryColor);
    return {
      normal: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      flipped: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`
    };
  }

  /**
   * Gets a color pair for an event title, with support for custom colors
   * @param eventTitle The event title to generate colors for
   * @param customColors Optional record of custom colors by realization code
   */
  static getColorPair(eventTitle: string, customColors?: Record<string, string>): { normal: string; flipped: string } {
    const colorKey = this.getColorKey(eventTitle);
    const realizationCode = RealizationApiService.extractRealizationCode(eventTitle);
    
    // Check if we have a custom color for this realization
    if (realizationCode && customColors && customColors[realizationCode]) {
      const primaryColor = customColors[realizationCode];
      const secondaryColor = this.lightenRgbColor(primaryColor);
      return {
        normal: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        flipped: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`
      };
    }
    
    // Fall back to default color generation
    return this.getDefaultColorPair(colorKey);
  }

  /**
   * Gets a seeded color for an event title, with support for custom colors
   * @param eventTitle The event title to generate color for
   * @param customColors Optional record of custom colors by realization code
   */
  static getSeededColor(eventTitle: string, customColors?: Record<string, string>): string {
    const colorKey = this.getColorKey(eventTitle);
    const realizationCode = RealizationApiService.extractRealizationCode(eventTitle);
    
    // Check if we have a custom color for this realization
    if (realizationCode && customColors && customColors[realizationCode]) {
      const primaryColor = customColors[realizationCode];
      const secondaryColor = this.lightenRgbColor(primaryColor);
      return `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    }
    
    // Fall back to default color generation
    const hash = this.hashString(colorKey);
    const colorIndex = hash % this.EVENT_COLORS.length;
    const primaryColor = this.EVENT_COLORS[colorIndex];
    const secondaryColor = this.lightenRgbColor(primaryColor);
    return `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  }

  /**
   * Gets a flipped seeded color for an event title, with support for custom colors
   * @param eventTitle The event title to generate color for
   * @param customColors Optional record of custom colors by realization code
   */
  static getSeededColorFlipped(eventTitle: string, customColors?: Record<string, string>): string {
    const colorKey = this.getColorKey(eventTitle);
    const realizationCode = RealizationApiService.extractRealizationCode(eventTitle);
    
    // Check if we have a custom color for this realization
    if (realizationCode && customColors && customColors[realizationCode]) {
      const primaryColor = customColors[realizationCode];
      const secondaryColor = this.lightenRgbColor(primaryColor);
      return `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`;
    }
    
    // Fall back to default color generation
    const hash = this.hashString(colorKey);
    const colorIndex = hash % this.EVENT_COLORS.length;
    const primaryColor = this.EVENT_COLORS[colorIndex];
    const secondaryColor = this.lightenRgbColor(primaryColor);
    return `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`;
  }

  static async retrieveScheduleFromUrl(calendarUrl?: string): Promise<{
    calendar: InstanceType<typeof ICAL.Component>;
    lastUpdated: string | null;
    calendarData: string;
    hash: string;
  }> {
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
      
      const { data, timestamp } = await response.json();
      const jcalData = ICAL.parse(data);
      const comp = new ICAL.Component(jcalData);
      
      // Calculate hash of the calendar data
      const hash = await this.calculateHash(data);
      
      return {
        calendar: comp,
        lastUpdated: typeof timestamp === 'string' ? timestamp : null,
        calendarData: data,
        hash
      };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  /**
   * Calculate SHA-256 hash of a string
   */
  private static async calculateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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

  static convertToScheduleEvent(vevent: InstanceType<typeof ICAL.Component>, index: number, customColors?: Record<string, string>): ScheduleEvent {
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
      color: this.getSeededColor(summary, customColors), // Use seeded color with custom color support
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
