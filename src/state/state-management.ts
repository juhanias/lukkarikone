import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as ICAL from 'ical.js';
import type { ScheduleEvent } from '../types/schedule';
import type { Font } from '../types/config';
import { ScheduleUtils } from '../utils/schedule-utils';

// Color theme definitions
interface Theme {
  id: string;
  name: string;
  description: string;
  delisted?: boolean; // Hidden from normal theme selector
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

const getThemes = (): Theme[] => [
  {
    id: "default",
    name: "Default",
    description: "wowww",
    colors: {
      background: "rgb(15, 23, 42)", // slate-900
      surface: "rgb(30, 41, 59)", // slate-800
      surfaceSecondary: "rgb(51, 65, 85)", // slate-700
      border: "rgb(71, 85, 105)", // slate-600
      text: "rgb(248, 250, 252)", // slate-50
      textSecondary: "rgb(148, 163, 184)", // slate-400
      accent: "rgb(59, 130, 246)", // blue-500
      accentSecondary: "rgb(37, 99, 235)", // blue-600
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
    }
  },
  {
    id: "boring",
    name: "Boring",
    description: "A slightly darker, less vibrant option",
    colors: {
      background: "rgb(23, 23, 23)", // neutral-900
      surface: "rgb(38, 38, 38)", // neutral-800
      surfaceSecondary: "rgb(64, 64, 64)", // neutral-700
      border: "rgb(82, 82, 91)", // zinc-600
      text: "rgb(250, 250, 250)", // neutral-50
      textSecondary: "rgb(161, 161, 170)", // zinc-400
      accent: "rgb(220, 38, 127)", // pink-600
      accentSecondary: "rgb(190, 24, 93)", // pink-700
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
    }
  },
  {
    id: "frog",
    name: "🐸 Frog Mode",
    description: "Ribbit ribbit! A wacky green swamp adventure",
    delisted: true, // This theme is hidden from normal theme selector
    colors: {
      background: "rgb(13, 46, 17)", // very dark forest green
      surface: "rgb(22, 78, 29)", // dark swamp green
      surfaceSecondary: "rgb(34, 118, 44)", // medium swamp green
      border: "rgb(55, 178, 71)", // bright lily pad green
      text: "rgb(240, 255, 242)", // very light mint
      textSecondary: "rgb(134, 239, 144)", // light green
      accent: "rgb(72, 214, 89)", // vibrant frog green
      accentSecondary: "rgb(56, 183, 71)", // slightly darker frog green
      success: "rgb(120, 255, 137)", // bright success green
      warning: "rgb(255, 235, 59)", // bright yellow (like frog eyes)
      error: "rgb(255, 87, 87)", // bright red (danger in the swamp)
    }
  },
];

// Get only the listed themes for normal theme selector
const getListedThemes = (): Theme[] => getThemes().filter(theme => !theme.delisted);

// Get all themes including delisted ones
const getAllThemes = (): Theme[] => getThemes();

interface Config {
  font: Font;
  theme: string;
  showWeekends: boolean;
  calendarUrl: string;
}

interface ConfigState {
  config: Config;
  getThemes: () => Theme[];
  getListedThemes: () => Theme[];
  getAllThemes: () => Theme[];
  setConfig: (partial: Partial<Config>) => void;
  resetConfig: () => void;
  getCurrentTheme: () => Theme;
}

const defaultConfig: Config = {
  font: "lexend",
  theme: "default", // Use the correct default theme ID
  showWeekends: true,
  calendarUrl: "",
};

const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      getThemes,
      getListedThemes,
      getAllThemes,
      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),
      resetConfig: () => set({ config: defaultConfig }),
      getCurrentTheme: () => {
        const { config } = get();
        const themes = getAllThemes();
        return themes.find(theme => theme.id === config.theme) || themes[0];
      },
    }),
    {
      name: "app-config", 
      partialize: (state) => ({ config: state.config }),
    }
  )
);

// Schedule date range state
type ViewMode = 'day' | 'week';

interface ScheduleRangeState {
  currentDate: Date;
  viewMode: ViewMode;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  getWeekStart: (date?: Date) => Date;
  getWeekDates: (date?: Date) => Date[];
}

const useScheduleRange = create<ScheduleRangeState>()((set, get) => ({
  currentDate: new Date(),
  viewMode: 'day',
  setCurrentDate: (date: Date) => set({ currentDate: date }),
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  goToPreviousDay: () => {
    const { currentDate } = get();
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    set({ currentDate: previousDay });
  },
  goToNextDay: () => {
    const { currentDate } = get();
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    set({ currentDate: nextDay });
  },
  goToPreviousWeek: () => {
    const { currentDate } = get();
    const previousWeek = new Date(currentDate);
    previousWeek.setDate(currentDate.getDate() - 7);
    set({ currentDate: previousWeek });
  },
  goToNextWeek: () => {
    const { currentDate } = get();
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 7);
    set({ currentDate: nextWeek });
  },
  goToToday: () => {
    set({ currentDate: new Date() });
  },
  getWeekStart: (date?: Date) => {
    const targetDate = date || get().currentDate;
    const start = new Date(targetDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  getWeekDates: (date?: Date) => {
    const weekStart = get().getWeekStart(date);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      dates.push(day);
    }
    return dates;
  },
}));

// Schedule state for managing events
interface ScheduleState {
  events: ScheduleEvent[];
  calendar: InstanceType<typeof ICAL.Component> | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  
  fetchSchedule: () => Promise<void>;
  getEventsForDate: (date: Date) => ScheduleEvent[];
  getEventsForWeek: (weekStart: Date) => { [key: string]: ScheduleEvent[] };
  refreshSchedule: () => Promise<void>;
  clearError: () => void;
}

const useScheduleStore = create<ScheduleState>()((set, get) => ({
  events: [],
  calendar: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchSchedule: async () => {
    // Don't fetch if we already have data from today
    const { lastFetched } = get();
    if (lastFetched && new Date().toDateString() === lastFetched.toDateString()) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      // Get the calendar URL from config store
      const { config } = useConfigStore.getState();
      const calendar = await ScheduleUtils.retrieveScheduleFromUrl(config.calendarUrl);
      
      // Get all events from the calendar
      const vevents = calendar.getAllSubcomponents('vevent');
      const events = vevents.map((vevent, index) => 
        ScheduleUtils.convertToScheduleEvent(vevent, index)
      );
      
      set({ 
        calendar, 
        events, 
        isLoading: false, 
        lastFetched: new Date() 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch schedule' 
      });
    }
  },

  getEventsForDate: (date: Date) => {
    const { events } = get();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  },

  getEventsForWeek: (weekStart: Date) => {
    const { events } = get();
    const weekEvents: { [key: string]: ScheduleEvent[] } = {};
    
    // Create a week's worth of dates
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      const dayKey = day.toDateString();
      weekEvents[dayKey] = events.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === dayKey;
      });
    }
    
    return weekEvents;
  },

  refreshSchedule: async () => {
    set({ lastFetched: null }); // Force refetch
    await get().fetchSchedule();
  },

  clearError: () => set({ error: null }),
}));

export default useConfigStore;
export { useScheduleRange, useScheduleStore };