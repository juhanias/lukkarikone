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
    // Header-specific colors
    headerAccent: string;
    headerAccentSecondary: string;
    headerText: string;
    headerBackground: string;
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
      // Header colors (same as regular accent for dark theme)
      headerAccent: "rgb(59, 130, 246)", // blue-500
      headerAccentSecondary: "rgb(37, 99, 235)", // blue-600
      headerText: "rgb(148, 163, 184)", // slate-400
      headerBackground: "rgb(30, 41, 59)", // slate-800 - matches surface-alpha-40 background from day/week switcher
    }
  },
  {
    id: "light",
    name: "Light One",
    description: "light mode (thumbs up)",
    colors: {
      background: "rgb(226, 232, 240)", // slate-200 - darker than previous slate-100
      surface: "rgb(241, 245, 249)", // slate-100 - slightly lighter surface
      surfaceSecondary: "rgb(203, 213, 225)", // slate-300
      border: "rgb(148, 163, 184)", // slate-400 - more prominent borders
      text: "rgb(15, 23, 42)", // slate-900
      textSecondary: "rgb(71, 85, 105)", // slate-600
      accent: "rgb(56, 189, 248)", // sky-400
      accentSecondary: "rgb(14, 165, 233)", // sky-500
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
      // Header colors - strong blue even in light mode
      headerAccent: "rgb(37, 99, 235)", // blue-600 - deeper blue for good contrast
      headerAccentSecondary: "rgb(29, 78, 216)", // blue-700
      headerText: "rgb(37, 99, 235)", // blue-600 - blue text for header elements
      headerBackground: "rgb(219, 234, 254)", // blue-100 - light blue background
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
      // Header colors (keep original pink accent)
      headerAccent: "rgb(220, 38, 127)", // pink-600
      headerAccentSecondary: "rgb(190, 24, 93)", // pink-700
      headerText: "rgb(161, 161, 170)", // zinc-400
      headerBackground: "rgb(38, 38, 38)", // neutral-800 - matches surface-alpha-40 background for consistency
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
      // Header colors (keep frog theme)
      headerAccent: "rgb(72, 214, 89)", // vibrant frog green
      headerAccentSecondary: "rgb(56, 183, 71)", // slightly darker frog green
      headerText: "rgb(134, 239, 144)", // light green
      headerBackground: "rgb(22, 78, 29)", // dark swamp green - matches surface-alpha-40 for consistency
    }
  },
];

// Get only the listed themes for normal theme selector
const getListedThemes = (): Theme[] => getThemes().filter(theme => !theme.delisted);

// Get all themes including delisted ones
const getAllThemes = (): Theme[] => getThemes();

// Helper function to determine if a theme is light or dark
const isLightTheme = (theme: Theme): boolean => {
  // Parse RGB values from background color
  const match = theme.colors.background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Calculate luminance using the relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5; // If luminance > 0.5, it's considered light
  }
  return false;
};

// Helper function to get the best opposing theme (light <-> dark)
const getOpposingTheme = (currentThemeId: string): string => {
  const themes = getListedThemes();
  const currentTheme = themes.find(t => t.id === currentThemeId);
  
  if (!currentTheme) return 'default';
  
  const isCurrentLight = isLightTheme(currentTheme);
  
  // Find the best opposing theme (light vs dark)
  const opposingThemes = themes.filter(theme => 
    theme.id !== currentThemeId && isLightTheme(theme) !== isCurrentLight
  );
  
  // Return the first opposing theme, or fallback to default themes
  if (opposingThemes.length > 0) {
    return opposingThemes[0].id;
  }
  
  // Fallback logic
  return isCurrentLight ? 'default' : 'ocean-breeze';
};

interface Config {
  font: Font;
  theme: string;
  showWeekends: boolean;
  calendarUrl: string;
  hiddenEventOpacity: number; // Opacity for hidden events (0-100)
  showCourseIdInSchedule: boolean;
}

interface ConfigState {
  config: Config;
  previousTheme: string; // Track the previous theme for toggling
  getThemes: () => Theme[];
  getListedThemes: () => Theme[];
  getAllThemes: () => Theme[];
  setConfig: (partial: Partial<Config>) => void;
  resetConfig: () => void;
  getCurrentTheme: () => Theme;
  isCurrentThemeLight: () => boolean;
  toggleLightDarkMode: () => void;
}

const defaultConfig: Config = {
  font: "lexend",
  theme: "default",
  showWeekends: false,
  calendarUrl: "",
  hiddenEventOpacity: 25,
  showCourseIdInSchedule: false,
};

const LEGACY_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=A64E5FCC3647C6FB5D7770DD86526B01FC67BD8A";
const UPDATED_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8";

const normalizeCalendarUrl = (url: string): string => url.trim();

const migrateCalendarUrl = (url: string): string => {
  const normalizedUrl = normalizeCalendarUrl(url);

  if (!normalizedUrl) {
    return normalizedUrl;
  }

  if (normalizedUrl === LEGACY_PTIVIS25B_URL) {
    return UPDATED_PTIVIS25B_URL;
  }

  return normalizedUrl;
};

const mergeConfigWithDefaults = (config?: Partial<Config>): Config => {
  if (!config) {
    return { ...defaultConfig };
  }

  const sanitizedEntries = Object.entries(config).filter(([, value]) => value !== undefined);
  const sanitizedConfig = Object.fromEntries(sanitizedEntries) as Partial<Config>;

  const mergedConfig: Config = {
    ...defaultConfig,
    ...sanitizedConfig,
  };

  return {
    ...mergedConfig,
    calendarUrl: migrateCalendarUrl(mergedConfig.calendarUrl),
  };
};

const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
  config: mergeConfigWithDefaults(defaultConfig),
      previousTheme: "default", // Initialize with default
      getThemes,
      getListedThemes,
      getAllThemes,
      setConfig: (partial) =>
        set((state) => ({
          config: mergeConfigWithDefaults({ ...state.config, ...partial }),
        })),
  resetConfig: () => set({ config: mergeConfigWithDefaults(), previousTheme: "default" }),
      getCurrentTheme: () => {
        const { config } = get();
        const themes = getAllThemes();
        return themes.find(theme => theme.id === config.theme) || themes[0];
      },
      isCurrentThemeLight: () => {
        const currentTheme = get().getCurrentTheme();
        return isLightTheme(currentTheme);
      },
      toggleLightDarkMode: () => {
        const { config, previousTheme } = get();
        const currentThemeId = config.theme;
        
        // If we have a previous theme and it's different from current, switch back to it
        if (previousTheme && previousTheme !== currentThemeId) {
          set((state) => ({
            config: { ...state.config, theme: previousTheme },
            previousTheme: currentThemeId
          }));
        } else {
          // Otherwise, find the best opposing theme
          const newTheme = getOpposingTheme(currentThemeId);
          set((state) => ({
            config: { ...state.config, theme: newTheme },
            previousTheme: currentThemeId
          }));
        }
      },
    }),
    {
      name: "app-config", 
      version: 1,
      migrate: (persistedState) => {
        if (!persistedState) {
          return persistedState;
        }

        const typedPersisted = persistedState as Partial<ConfigState>;

        if (!typedPersisted.config) {
          return typedPersisted;
        }

        const migratedCalendarUrl = migrateCalendarUrl(typedPersisted.config.calendarUrl ?? "");

        return {
          ...typedPersisted,
          config: {
            ...typedPersisted.config,
            calendarUrl: migratedCalendarUrl,
          },
        };
      },
      partialize: (state) => ({ config: state.config, previousTheme: state.previousTheme }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as Partial<ConfigState> | undefined;

        return {
          ...currentState,
          ...typedPersisted,
          config: mergeConfigWithDefaults(typedPersisted?.config),
          previousTheme: typedPersisted?.previousTheme ?? currentState.previousTheme,
        };
      },
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

const useScheduleRange = create<ScheduleRangeState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: "schedule-range",
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);

// Color customization state for realization colors
interface RealizationColorState {
  customColors: Record<string, string>; // realization code -> primary color (rgb)
  
  getRealizationColor: (realizationCode: string) => string;
  setRealizationColor: (realizationCode: string, color: string) => void;
  resetRealizationColor: (realizationCode: string) => void;
  clearAllCustomColors: () => void;
  hasCustomColor: (realizationCode: string) => boolean;
}

// Schedule state for managing events
interface ScheduleState {
  events: ScheduleEvent[];
  calendar: InstanceType<typeof ICAL.Component> | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  lastUpdated: Date | null;
  
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
  lastUpdated: null,

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
      
      // Get custom colors from realization color store
      const { customColors } = useRealizationColorStore.getState();
      
  const { calendar, lastUpdated } = await ScheduleUtils.retrieveScheduleFromUrl(config.calendarUrl);
      
      // Get all events from the calendar
      const vevents = calendar.getAllSubcomponents('vevent');
      const events = vevents.map((vevent, index) => 
        ScheduleUtils.convertToScheduleEvent(vevent, index, customColors)
      );

      const parsedLastUpdated = lastUpdated ? new Date(lastUpdated) : null;
      const validLastUpdated = parsedLastUpdated && !isNaN(parsedLastUpdated.getTime()) ? parsedLastUpdated : null;
      
      set({ 
        calendar, 
        events, 
        isLoading: false, 
        lastFetched: new Date(),
        lastUpdated: validLastUpdated
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

const useRealizationColorStore = create<RealizationColorState>()(
  persist(
    (set, get) => ({
      customColors: {},
      
      getRealizationColor: (realizationCode: string) => {
        const { customColors } = get();
        // Return custom color if it exists, otherwise return default generated color
        if (customColors[realizationCode]) {
          return customColors[realizationCode];
        }
        // Generate default color using the existing logic
        return ScheduleUtils.getDefaultRealizationColor(realizationCode);
      },
      
      setRealizationColor: (realizationCode: string, color: string) => {
        set((state) => ({
          customColors: {
            ...state.customColors,
            [realizationCode]: color
          }
        }));
      },
      
      resetRealizationColor: (realizationCode: string) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [realizationCode]: _, ...rest } = state.customColors;
          return { customColors: rest };
        });
      },
      
      clearAllCustomColors: () => {
        set({ customColors: {} });
      },
      
      hasCustomColor: (realizationCode: string) => {
        const { customColors } = get();
        return realizationCode in customColors;
      }
    }),
    {
      name: "realization-colors",
      partialize: (state) => ({ customColors: state.customColors }),
    }
  )
);

// Hidden events state for managing event visibility
interface HiddenEventsState {
  hiddenEventIds: Set<string>;
  
  isEventHidden: (eventId: string) => boolean;
  hideEvent: (eventId: string) => void;
  showEvent: (eventId: string) => void;
  toggleEventVisibility: (eventId: string) => void;
  clearAllHiddenEvents: () => void;
}

const useHiddenEventsStore = create<HiddenEventsState>()(
  persist(
    (set, get) => ({
      hiddenEventIds: new Set<string>(),
      
      isEventHidden: (eventId: string) => {
        const { hiddenEventIds } = get();
        return hiddenEventIds.has(eventId);
      },
      
      hideEvent: (eventId: string) => {
        set((state) => ({
          hiddenEventIds: new Set([...state.hiddenEventIds, eventId])
        }));
      },
      
      showEvent: (eventId: string) => {
        set((state) => {
          const newSet = new Set(state.hiddenEventIds);
          newSet.delete(eventId);
          return { hiddenEventIds: newSet };
        });
      },
      
      toggleEventVisibility: (eventId: string) => {
        const { isEventHidden } = get();
        if (isEventHidden(eventId)) {
          get().showEvent(eventId);
        } else {
          get().hideEvent(eventId);
        }
      },
      
      clearAllHiddenEvents: () => {
        set({ hiddenEventIds: new Set<string>() });
      }
    }),
    {
      name: "hidden-events",
      partialize: (state) => ({ 
        hiddenEventIds: Array.from(state.hiddenEventIds) // Convert Set to Array for serialization
      }),
      // Custom storage to handle Set serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              hiddenEventIds: new Set(parsed.state.hiddenEventIds || [])
            }
          };
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              hiddenEventIds: Array.from(value.state.hiddenEventIds)
            }
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);

export default useConfigStore;
export { useScheduleRange, useScheduleStore, useRealizationColorStore, useHiddenEventsStore };