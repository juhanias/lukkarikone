import { create } from "zustand";
import { persist } from "zustand/middleware";
import ICAL from 'ical.js';
import type { ScheduleEvent } from '../types/schedule';
import type { Font } from '../types/config';
import { ScheduleUtils } from '../utils/schedule-utils';
import type { Calendar, CalendarState } from '../types/calendar';

// Color theme definitions
interface Theme {
  id: string;
  nameKey?: string;
  descriptionKey?: string
  name?: string; // deprecated, use nameKey
  description?: string; // deprecated, use descriptionKey
  delisted?: boolean;
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
    nameKey: "sections.theme.themes.default.name",
    descriptionKey: "sections.theme.themes.default.description",
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
    id: "purple",
    nameKey: "sections.theme.themes.purple.name",
    descriptionKey: "sections.theme.themes.purple.description",
    colors: {
      background: "rgb(17, 15, 28)", // very dark muted purple
      surface: "rgb(28, 24, 42)", // dark muted purple
      surfaceSecondary: "rgb(42, 36, 60)", // medium muted purple
      border: "rgb(75, 60, 100)", // subdued purple
      text: "rgb(248, 250, 252)", // slate-50
      textSecondary: "rgb(155, 140, 180)", // muted purple-grey
      accent: "rgb(140, 100, 210)", // muted purple
      accentSecondary: "rgb(120, 80, 190)", // darker muted purple
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
      // Header colors (purple theme)
      headerAccent: "rgb(140, 100, 210)", // muted purple
      headerAccentSecondary: "rgb(120, 80, 190)", // darker muted purple
      headerText: "rgb(155, 140, 180)", // muted purple-grey
      headerBackground: "rgb(28, 24, 42)", // dark muted purple - matches surface
    }
  },
  {
    id: "dark-pink",
    nameKey: "sections.theme.themes.dark-pink.name",
    descriptionKey: "sections.theme.themes.dark-pink.description",
    colors: {
      background: "rgb(28, 15, 22)", // very dark muted pink
      surface: "rgb(42, 24, 34)", // dark muted pink
      surfaceSecondary: "rgb(60, 36, 48)", // medium muted pink
      border: "rgb(100, 60, 85)", // subdued pink
      text: "rgb(248, 250, 252)", // slate-50
      textSecondary: "rgb(200, 140, 175)", // muted pink-grey
      accent: "rgb(210, 100, 160)", // muted dark pink
      accentSecondary: "rgb(190, 80, 140)", // darker muted pink
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
      // Header colors (dark pink theme)
      headerAccent: "rgb(210, 100, 160)", // muted dark pink
      headerAccentSecondary: "rgb(190, 80, 140)", // darker muted pink
      headerText: "rgb(200, 140, 175)", // muted pink-grey
      headerBackground: "rgb(42, 24, 34)", // dark muted pink - matches surface
    }
  },
  {
    id: "light",
    nameKey: "sections.theme.themes.light.name",
    descriptionKey: "sections.theme.themes.light.description",
    colors: {
      background: "rgb(243, 244, 246)", // gray-100
      surface: "rgb(255, 255, 255)", // white
      surfaceSecondary: "rgb(229, 231, 235)", // gray-200
      border: "rgb(209, 213, 219)", // gray-300
      text: "rgb(17, 24, 39)", // gray-900
      textSecondary: "rgb(75, 85, 99)", // gray-600
      accent: "rgb(37, 99, 235)", // blue-600
      accentSecondary: "rgb(29, 78, 216)", // blue-700
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
      // Header colors
      headerAccent: "rgb(37, 99, 235)", // blue-600
      headerAccentSecondary: "rgb(29, 78, 216)", // blue-700
      headerText: "rgb(255, 255, 255)", // white
      headerBackground: "rgb(37, 99, 235)", // blue-600
    }
  },
  {
    id: "boring",
    nameKey: "sections.theme.themes.boring.name",
    descriptionKey: "sections.theme.themes.boring.description",
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
    nameKey: "sections.theme.themes.frog.name",
    descriptionKey: "sections.theme.themes.frog.description",
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
  {
    id: "forest",
    nameKey: "sections.theme.themes.forest.name",
    descriptionKey: "sections.theme.themes.forest.description",
    colors: {
      background: "rgb(23, 23, 23)", // neutral-900
      surface: "rgb(38, 38, 38)", // neutral-800
      surfaceSecondary: "rgb(64, 64, 64)", // neutral-700
      border: "rgb(82, 82, 91)", // zinc-600
      text: "rgb(250, 250, 250)", // neutral-50
      textSecondary: "rgb(161, 161, 170)", // zinc-400
      accent: "rgb(34, 197, 94)", // green-500
      accentSecondary: "rgb(22, 163, 74)", // green-600
      success: "rgb(34, 197, 94)", // green-500
      warning: "rgb(245, 158, 11)", // amber-500
      error: "rgb(239, 68, 68)", // red-500
      // Header colors (green accent)
      headerAccent: "rgb(34, 197, 94)", // green-500
      headerAccentSecondary: "rgb(22, 163, 74)", // green-600
      headerText: "rgb(161, 161, 170)", // zinc-400
      headerBackground: "rgb(38, 38, 38)", // neutral-800 - matches surface
    }
  }
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
  hiddenEventOpacity: number; // Opacity for hidden events (0-100)
  showCourseIdInSchedule: boolean;
  enhancedDialogs: boolean;
  squeezeWeekOnMobile: boolean;
  devToolsVisible?: boolean;
  devToolsEnableEventGenerator?: boolean;
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
  font: "system",
  theme: "default",
  showWeekends: false,
  hiddenEventOpacity: 25,
  showCourseIdInSchedule: false,
  enhancedDialogs: true,
  squeezeWeekOnMobile: false,
  devToolsVisible: false,
  devToolsEnableEventGenerator: false,
};

const LEGACY_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=A64E5FCC3647C6FB5D7770DD86526B01FC67BD8A";
const UPDATED_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8";

// Preset calendar URLs for migration
const PRESET_CALENDARS = [
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=9385A6CBC6B79C3DDCE6B2738B5C1B882A6D64CA',
    name: 'PTIVIS25A'
  },
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8',
    name: 'PTIVIS25B'
  },
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=E4AC87D135AF921A83B677DD15A19E6119DDF0BB',
    name: 'PTIVIS25C'
  },
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=E8F13D455EA82E8A7D0990CF6983BBE61AD839A7',
    name: 'PTIVIS25D'
  },
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=346C225AD26BD6966FC656F8E77B5A3EA38A73B5',
    name: 'PTIVIS25E'
  },
  {
    url: 'http://lukkari.turkuamk.fi/ical.php?hash=6EAF3A6D4FC2B07836C2B742EC923629839CA0B7',
    name: 'PTIVIS25F'
  }
] as const;

const normalizeCalendarUrl = (url: string): string => url.trim();

const getPresetCalendarName = (url: string): string | null => {
  const preset = PRESET_CALENDARS.find(p => p.url === url);
  return preset ? preset.name : null;
};

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

  return mergedConfig;
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
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { config?: Record<string, unknown> } | undefined;

        if (version < 2 && state?.config?.calendarUrl) {
          console.log('Removing legacy calendarUrl from config');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { calendarUrl: _calendarUrl, ...configWithoutUrl } = state.config;
          return {
            ...state,
            config: configWithoutUrl
          };
        }

        return persistedState;
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

// Per-URL cache entry
interface ICalCache {
  url: string;
  calendarData: string;
  hash: string;
  lastFetched: Date;
  lastUpdated: Date | null; // From the iCal metadata
}

// Schedule state for managing events
interface ScheduleState {
  events: ScheduleEvent[];
  calendar: InstanceType<typeof ICAL.Component> | null;
  isLoading: boolean;
  isCheckingHash: boolean;
  isFetchingCalendar: boolean;
  error: string | null;
  lastFetched: Date | null;
  lastUpdated: Date | null; // Oldest update time across all cached iCals
  icalCaches: Record<string, ICalCache>; // Cache per URL
  lastActiveCalendarId: string | null; // Track which calendar was last fetched

  fetchSchedule: () => Promise<void>;
  getEventsForDate: (date: Date) => ScheduleEvent[];
  getEventsForWeek: (weekStart: Date) => { [key: string]: ScheduleEvent[] };
  refreshSchedule: () => Promise<void>;
  clearError: () => void;
  getICalCacheInfo: () => { url: string; lastUpdated: Date | null; lastFetched: Date }[];
}

const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      events: [],
      calendar: null,
      isLoading: false,
      isCheckingHash: false,
      isFetchingCalendar: false,
      error: null,
      lastFetched: null,
      lastUpdated: null,
      icalCaches: {},
      lastActiveCalendarId: null,

      fetchSchedule: async () => {
        const state = get();

        // Get the active calendar from calendar store
        const { getActiveCalendar } = useCalendarStore.getState();
        const activeCalendar = getActiveCalendar();
        const currentCalendarId = activeCalendar?.id || null;

        // Check if calendar has changed - if so, force refresh
        const calendarChanged = state.lastActiveCalendarId !== currentCalendarId;

        // Don't fetch if we already have data from today AND calendar hasn't changed
        if (!calendarChanged && state.lastFetched && new Date().toDateString() === state.lastFetched.toDateString()) {
          return;
        }

        // If calendar changed, clear events but keep URL caches
        if (calendarChanged) {
          console.log('Active calendar changed, refreshing...');
          set({
            events: [],
            lastFetched: null
          });
        }

        // Get calendar URLs from active calendar
        const calendarUrls = activeCalendar?.icalUrls || [];

        if (calendarUrls.length === 0) {
          // No calendar URLs configured - silently return without error
          set({ 
            isLoading: false, 
            isCheckingHash: false, 
            isFetchingCalendar: false 
          });
          return;
        }

        // Only show blocking loader if we have no events data
        const hasExistingData = state.events.length > 0;
        set({ 
          isLoading: !hasExistingData, 
          isCheckingHash: true, 
          error: null 
        });

        try {
          const { customColors } = useRealizationColorStore.getState();
          const eventsByUid = new Map<string, ScheduleEvent>();
          const newIcalCaches: Record<string, ICalCache> = { ...state.icalCaches };
          let eventIndexCounter = 0;
          let oldestUpdateTime: Date | null = null;

          // Process each URL
          for (const url of calendarUrls) {
            try {
              const cachedEntry = state.icalCaches[url];
              let shouldFetch = true;
              let calendarData = '';
              let hash = '';
              let icalLastUpdated: Date | null = null;

              // Check hash first if we have a cache
              if (cachedEntry && !calendarChanged) {
                try {
                  const { hash: latestHash } = await ScheduleUtils.checkCalendarHash(url);
                  
                  if (cachedEntry.hash === latestHash) {
                    console.log(`Hash matches for ${url} - using cached data`);
                    shouldFetch = false;
                    calendarData = cachedEntry.calendarData;
                    hash = cachedEntry.hash;
                    icalLastUpdated = cachedEntry.lastUpdated;
                  }
                } catch (hashError) {
                  console.error(`Error checking hash for ${url}:`, hashError);
                  // Continue to fetch
                }
              }

              // Fetch if needed
              if (shouldFetch) {
                console.log(`Fetching calendar from ${url}`);
                const result = await ScheduleUtils.retrieveScheduleFromUrl(url);
                calendarData = result.calendarData;
                hash = result.hash;
                
                const parsedLastUpdated = result.lastUpdated ? new Date(result.lastUpdated) : null;
                icalLastUpdated = parsedLastUpdated && !isNaN(parsedLastUpdated.getTime()) 
                  ? parsedLastUpdated 
                  : null;

                // Update cache for this URL
                newIcalCaches[url] = {
                  url,
                  calendarData,
                  hash,
                  lastFetched: new Date(),
                  lastUpdated: icalLastUpdated
                };
              }

              // Parse events from this URL
              const jcalData = ICAL.parse(calendarData);
              const calendar = new ICAL.Component(jcalData);
              const vevents = calendar.getAllSubcomponents('vevent');

              for (const vevent of vevents) {
                const event = ScheduleUtils.convertToScheduleEvent(vevent, eventIndexCounter++, customColors);
                // Deduplicate by UID
                if (!eventsByUid.has(event.id)) {
                  eventsByUid.set(event.id, event);
                }
              }

              // Track oldest update time
              if (icalLastUpdated) {
                if (!oldestUpdateTime || icalLastUpdated < oldestUpdateTime) {
                  oldestUpdateTime = icalLastUpdated;
                }
              }

            } catch (urlError) {
              console.error(`Error fetching calendar from ${url}:`, urlError);
              // Continue with other URLs
            }
          }

          const allEvents = Array.from(eventsByUid.values());
          const now = new Date();

          set({
            events: allEvents,
            isLoading: false,
            isCheckingHash: false,
            isFetchingCalendar: false,
            lastFetched: now,
            lastUpdated: oldestUpdateTime,
            icalCaches: newIcalCaches,
            lastActiveCalendarId: currentCalendarId
          });

        } catch (error) {
          set({
            isLoading: false,
            isCheckingHash: false,
            isFetchingCalendar: false,
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

      getICalCacheInfo: () => {
        const state = get();
        return Object.values(state.icalCaches).map(cache => ({
          url: cache.url,
          lastUpdated: cache.lastUpdated,
          lastFetched: cache.lastFetched
        }));
      },
    }),
    {
      name: 'schedule-storage',
      partialize: (state) => ({
        icalCaches: state.icalCaches,
        lastActiveCalendarId: state.lastActiveCalendarId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ScheduleState>;
        
        // Convert date strings back to Date objects in icalCaches
        const icalCaches: Record<string, ICalCache> = {};
        if (persisted.icalCaches) {
          Object.entries(persisted.icalCaches).forEach(([url, cache]) => {
            icalCaches[url] = {
              ...cache,
              lastFetched: cache.lastFetched ? new Date(cache.lastFetched) : new Date(),
              lastUpdated: cache.lastUpdated ? new Date(cache.lastUpdated) : null,
            };
          });
        }
        
        return {
          ...currentState,
          ...persisted,
          icalCaches,
        };
      },
    }
  )
);

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

// Calendar management store
const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      activeCalendarId: null,

      addCalendar: (name: string, icalUrls: string[] = []) => {
        const id = `calendar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const now = Date.now();
        const newCalendar: Calendar = {
          id,
          name,
          icalUrls,
          createdAt: now,
          updatedAt: now
        };

        set((state) => {
          const calendars = [...state.calendars, newCalendar];
          // If this is the first calendar, set it as active
          const activeCalendarId = state.activeCalendarId || id;
          return { calendars, activeCalendarId };
        });

        return id;
      },

      updateCalendar: (id: string, updates: Partial<Omit<Calendar, 'id' | 'createdAt'>>) => {
        set((state) => ({
          calendars: state.calendars.map(cal =>
            cal.id === id
              ? { ...cal, ...updates, updatedAt: Date.now() }
              : cal
          )
        }));
      },

      deleteCalendar: (id: string) => {
        set((state) => {
          const calendars = state.calendars.filter(cal => cal.id !== id);
          // If we deleted the active calendar, set a new active one
          let activeCalendarId = state.activeCalendarId;
          if (activeCalendarId === id) {
            activeCalendarId = calendars.length > 0 ? calendars[0].id : null;
          }
          return { calendars, activeCalendarId };
        });
      },

      getCalendar: (id: string) => {
        return get().calendars.find(cal => cal.id === id);
      },

      getActiveCalendar: () => {
        const { calendars, activeCalendarId } = get();
        if (!activeCalendarId) return undefined;
        return calendars.find(cal => cal.id === activeCalendarId);
      },

      setActiveCalendar: (id: string) => {
        const calendar = get().getCalendar(id);
        if (calendar) {
          set({ activeCalendarId: id });
          // Trigger schedule refresh when calendar changes
          setTimeout(() => {
            useScheduleStore.getState().refreshSchedule();
          }, 0);
        }
      },

      addIcalUrl: (calendarId: string, url: string) => {
        set((state) => ({
          calendars: state.calendars.map(cal =>
            cal.id === calendarId
              ? {
                  ...cal,
                  icalUrls: [...cal.icalUrls, url],
                  updatedAt: Date.now()
                }
              : cal
          )
        }));
        
        // Refresh if we modified the active calendar
        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            useScheduleStore.getState().refreshSchedule();
          }, 0);
        }
      },

      removeIcalUrl: (calendarId: string, url: string) => {
        set((state) => ({
          calendars: state.calendars.map(cal =>
            cal.id === calendarId
              ? {
                  ...cal,
                  icalUrls: cal.icalUrls.filter(u => u !== url),
                  updatedAt: Date.now()
                }
              : cal
          )
        }));
        
        // Refresh if we modified the active calendar
        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            useScheduleStore.getState().refreshSchedule();
          }, 0);
        }
      },

      updateIcalUrl: (calendarId: string, oldUrl: string, newUrl: string) => {
        set((state) => ({
          calendars: state.calendars.map(cal =>
            cal.id === calendarId
              ? {
                  ...cal,
                  icalUrls: cal.icalUrls.map(u => u === oldUrl ? newUrl : u),
                  updatedAt: Date.now()
                }
              : cal
          )
        }));
        
        // Refresh if we modified the active calendar
        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            useScheduleStore.getState().refreshSchedule();
          }, 0);
        }
      }
    }),
    {
      name: "calendars",
      version: 2,
      partialize: (state) => ({
        calendars: state.calendars,
        activeCalendarId: state.activeCalendarId
      }),
      migrate: (persistedState: unknown, version: number) => {
        // Migration from version 1 (or no version) to version 2
        if (version < 2) {
          const state = persistedState as Partial<CalendarState>;

          // Check if we need to migrate from legacy config.calendarUrl
          const configState = localStorage.getItem('app-config');
          if (configState) {
            try {
              const config = JSON.parse(configState);
              const legacyUrl = config?.state?.config?.calendarUrl;

              if (legacyUrl && legacyUrl.trim() && legacyUrl !== 'MIGRATED') {
                // Migrate the legacy URL (handle PTIVIS25B URL updates)
                const migratedUrl = migrateCalendarUrl(legacyUrl.trim());

                // Determine calendar name - use preset name if available, otherwise 'Default'
                const calendarName = getPresetCalendarName(migratedUrl) || 'Default';

                // Create default calendar from legacy URL
                const now = Date.now();
                const defaultCalendar: Calendar = {
                  id: `calendar-${now}-migrated`,
                  name: calendarName,
                  icalUrls: [migratedUrl],
                  createdAt: now,
                  updatedAt: now
                };

                console.log(`Migrating legacy calendar URL to calendar system - wiping existing calendars (name: ${calendarName})`);

                // Mark the legacy calendarUrl as migrated in app-config
                if (config?.state?.config) {
                  config.state.config.calendarUrl = 'MIGRATED';
                  localStorage.setItem('app-config', JSON.stringify(config));
                }

                // Wipe all existing calendars and replace with the migrated default
                return {
                  ...state,
                  calendars: [defaultCalendar],
                  activeCalendarId: defaultCalendar.id
                };
              }
            } catch (e) {
              console.error('Failed to migrate legacy calendar URL:', e);
            }
          }
        }

        return persistedState;
      }
    }
  )
);

export default useConfigStore;
export type { ConfigState };
export { useScheduleRange, useScheduleStore, useRealizationColorStore, useHiddenEventsStore, useCalendarStore };