import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Font } from '../types/config';

// Color theme definitions
export interface Theme {
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
      background: "rgb(15, 23, 42)",
      surface: "rgb(30, 41, 59)",
      surfaceSecondary: "rgb(51, 65, 85)",
      border: "rgb(71, 85, 105)",
      text: "rgb(248, 250, 252)",
      textSecondary: "rgb(148, 163, 184)",
      accent: "rgb(59, 130, 246)",
      accentSecondary: "rgb(37, 99, 235)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(59, 130, 246)",
      headerAccentSecondary: "rgb(37, 99, 235)",
      headerText: "rgb(148, 163, 184)",
      headerBackground: "rgb(30, 41, 59)",
    }
  },
  {
    id: "purple",
    nameKey: "sections.theme.themes.purple.name",
    descriptionKey: "sections.theme.themes.purple.description",
    colors: {
      background: "rgb(17, 15, 28)",
      surface: "rgb(28, 24, 42)",
      surfaceSecondary: "rgb(42, 36, 60)",
      border: "rgb(75, 60, 100)",
      text: "rgb(248, 250, 252)",
      textSecondary: "rgb(155, 140, 180)",
      accent: "rgb(140, 100, 210)",
      accentSecondary: "rgb(120, 80, 190)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(140, 100, 210)",
      headerAccentSecondary: "rgb(120, 80, 190)",
      headerText: "rgb(155, 140, 180)",
      headerBackground: "rgb(28, 24, 42)",
    }
  },
  {
    id: "dark-pink",
    nameKey: "sections.theme.themes.dark-pink.name",
    descriptionKey: "sections.theme.themes.dark-pink.description",
    colors: {
      background: "rgb(28, 15, 22)",
      surface: "rgb(42, 24, 34)",
      surfaceSecondary: "rgb(60, 36, 48)",
      border: "rgb(100, 60, 85)",
      text: "rgb(248, 250, 252)",
      textSecondary: "rgb(200, 140, 175)",
      accent: "rgb(210, 100, 160)",
      accentSecondary: "rgb(190, 80, 140)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(210, 100, 160)",
      headerAccentSecondary: "rgb(190, 80, 140)",
      headerText: "rgb(200, 140, 175)",
      headerBackground: "rgb(42, 24, 34)",
    }
  },
  {
    id: "light",
    nameKey: "sections.theme.themes.light.name",
    descriptionKey: "sections.theme.themes.light.description",
    colors: {
      background: "rgb(243, 244, 246)",
      surface: "rgb(255, 255, 255)",
      surfaceSecondary: "rgb(229, 231, 235)",
      border: "rgb(209, 213, 219)",
      text: "rgb(17, 24, 39)",
      textSecondary: "rgb(75, 85, 99)",
      accent: "rgb(37, 99, 235)",
      accentSecondary: "rgb(29, 78, 216)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(37, 99, 235)",
      headerAccentSecondary: "rgb(29, 78, 216)",
      headerText: "rgb(255, 255, 255)",
      headerBackground: "rgb(37, 99, 235)",
    }
  },
  {
    id: "boring",
    nameKey: "sections.theme.themes.boring.name",
    descriptionKey: "sections.theme.themes.boring.description",
    colors: {
      background: "rgb(23, 23, 23)",
      surface: "rgb(38, 38, 38)",
      surfaceSecondary: "rgb(64, 64, 64)",
      border: "rgb(82, 82, 91)",
      text: "rgb(250, 250, 250)",
      textSecondary: "rgb(161, 161, 170)",
      accent: "rgb(220, 38, 127)",
      accentSecondary: "rgb(190, 24, 93)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(220, 38, 127)",
      headerAccentSecondary: "rgb(190, 24, 93)",
      headerText: "rgb(161, 161, 170)",
      headerBackground: "rgb(38, 38, 38)",
    }
  },
  {
    id: "frog",
    nameKey: "sections.theme.themes.frog.name",
    descriptionKey: "sections.theme.themes.frog.description",
    colors: {
      background: "rgb(13, 46, 17)",
      surface: "rgb(22, 78, 29)",
      surfaceSecondary: "rgb(34, 118, 44)",
      border: "rgb(55, 178, 71)",
      text: "rgb(240, 255, 242)",
      textSecondary: "rgb(134, 239, 144)",
      accent: "rgb(72, 214, 89)",
      accentSecondary: "rgb(56, 183, 71)",
      success: "rgb(120, 255, 137)",
      warning: "rgb(255, 235, 59)",
      error: "rgb(255, 87, 87)",
      headerAccent: "rgb(72, 214, 89)",
      headerAccentSecondary: "rgb(56, 183, 71)",
      headerText: "rgb(134, 239, 144)",
      headerBackground: "rgb(22, 78, 29)",
    }
  },
  {
    id: "forest",
    nameKey: "sections.theme.themes.forest.name",
    descriptionKey: "sections.theme.themes.forest.description",
    colors: {
      background: "rgb(23, 23, 23)",
      surface: "rgb(38, 38, 38)",
      surfaceSecondary: "rgb(64, 64, 64)",
      border: "rgb(82, 82, 91)",
      text: "rgb(250, 250, 250)",
      textSecondary: "rgb(161, 161, 170)",
      accent: "rgb(34, 197, 94)",
      accentSecondary: "rgb(22, 163, 74)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(34, 197, 94)",
      headerAccentSecondary: "rgb(22, 163, 74)",
      headerText: "rgb(161, 161, 170)",
      headerBackground: "rgb(38, 38, 38)",
    }
  }
];

export const getListedThemes = (): Theme[] => getThemes().filter(theme => !theme.delisted);
export const getAllThemes = (): Theme[] => getThemes();

const isLightTheme = (theme: Theme): boolean => {
  const match = theme.colors.background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  return false;
};

const getOpposingTheme = (currentThemeId: string): string => {
  const themes = getListedThemes();
  const currentTheme = themes.find(t => t.id === currentThemeId);

  if (!currentTheme) return 'default';

  const isCurrentLight = isLightTheme(currentTheme);

  const opposingThemes = themes.filter(theme =>
    theme.id !== currentThemeId && isLightTheme(theme) !== isCurrentLight
  );

  if (opposingThemes.length > 0) {
    return opposingThemes[0].id;
  }

  return isCurrentLight ? 'default' : 'ocean-breeze';
};

interface Config {
  font: Font;
  theme: string;
  showWeekends: boolean;
  hiddenEventOpacity: number;
  showCourseIdInSchedule: boolean;
  showTotalHours: boolean;
  enhancedDialogs: boolean;
  squeezeWeekOnMobile: boolean;
  enableCommitNotifications?: boolean;
  devToolsVisible?: boolean;
  devToolsEnableEventGenerator?: boolean;
}

export interface ConfigState {
  config: Config;
  previousTheme: string;
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
  showTotalHours: true,
  enhancedDialogs: true,
  squeezeWeekOnMobile: false,
  enableCommitNotifications: false,
  devToolsVisible: false,
  devToolsEnableEventGenerator: false,
};

export const LEGACY_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=A64E5FCC3647C6FB5D7770DD86526B01FC67BD8A";
export const UPDATED_PTIVIS25B_URL = "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8";

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

export const getPresetCalendarName = (url: string): string | null => {
  const preset = PRESET_CALENDARS.find(p => p.url === url);
  return preset ? preset.name : null;
};

export const migrateCalendarUrl = (url: string): string => {
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
      previousTheme: "default",
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

        if (previousTheme && previousTheme !== currentThemeId) {
          set((state) => ({
            config: { ...state.config, theme: previousTheme },
            previousTheme: currentThemeId
          }));
        } else {
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

export default useConfigStore;
