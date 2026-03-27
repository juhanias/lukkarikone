import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PRESET_CALENDARS } from "../lib/preset-calendars";
import { FONT_OPTIONS, type Font } from "../types/config";

// Color theme definitions
export interface Theme {
  id: string;
  nameKey?: string;
  descriptionKey?: string;
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
      background: "rgb(17, 20, 35)",
      surface: "rgb(28, 33, 52)",
      surfaceSecondary: "rgb(43, 50, 74)",
      border: "rgb(82, 92, 130)",
      text: "rgb(244, 247, 255)",
      textSecondary: "rgb(167, 177, 211)",
      accent: "rgb(104, 125, 255)",
      accentSecondary: "rgb(84, 103, 232)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(104, 125, 255)",
      headerAccentSecondary: "rgb(84, 103, 232)",
      headerText: "rgb(167, 177, 211)",
      headerBackground: "rgb(28, 33, 52)",
    },
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
    },
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
    },
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
    },
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
    },
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
    },
  },
  {
    id: "muted-coral",
    nameKey: "sections.theme.themes.muted-coral.name",
    descriptionKey: "sections.theme.themes.muted-coral.description",
    colors: {
      background: "rgb(28, 24, 24)",
      surface: "rgb(42, 35, 35)",
      surfaceSecondary: "rgb(60, 50, 50)",
      border: "rgb(112, 90, 90)",
      text: "rgb(250, 244, 242)",
      textSecondary: "rgb(201, 170, 164)",
      accent: "rgb(214, 128, 112)",
      accentSecondary: "rgb(190, 104, 90)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(214, 128, 112)",
      headerAccentSecondary: "rgb(190, 104, 90)",
      headerText: "rgb(201, 170, 164)",
      headerBackground: "rgb(42, 35, 35)",
    },
  },
  {
    id: "casual-ruby",
    nameKey: "sections.theme.themes.casual-ruby.name",
    descriptionKey: "sections.theme.themes.casual-ruby.description",
    colors: {
      background: "rgb(31, 17, 20)",
      surface: "rgb(48, 25, 30)",
      surfaceSecondary: "rgb(68, 37, 43)",
      border: "rgb(119, 68, 77)",
      text: "rgb(255, 242, 244)",
      textSecondary: "rgb(224, 172, 180)",
      accent: "rgb(214, 84, 96)",
      accentSecondary: "rgb(187, 64, 76)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(214, 84, 96)",
      headerAccentSecondary: "rgb(187, 64, 76)",
      headerText: "rgb(224, 172, 180)",
      headerBackground: "rgb(48, 25, 30)",
    },
  },
  {
    id: "olive",
    nameKey: "sections.theme.themes.olive.name",
    descriptionKey: "sections.theme.themes.olive.description",
    colors: {
      background: "rgb(24, 28, 20)",
      surface: "rgb(37, 43, 30)",
      surfaceSecondary: "rgb(56, 64, 46)",
      border: "rgb(98, 110, 80)",
      text: "rgb(246, 248, 240)",
      textSecondary: "rgb(178, 188, 159)",
      accent: "rgb(156, 182, 90)",
      accentSecondary: "rgb(132, 158, 68)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(156, 182, 90)",
      headerAccentSecondary: "rgb(132, 158, 68)",
      headerText: "rgb(178, 188, 159)",
      headerBackground: "rgb(37, 43, 30)",
    },
  },
  {
    id: "gold-rush",
    nameKey: "sections.theme.themes.gold-rush.name",
    descriptionKey: "sections.theme.themes.gold-rush.description",
    colors: {
      background: "rgb(29, 24, 20)",
      surface: "rgb(44, 35, 30)",
      surfaceSecondary: "rgb(63, 50, 42)",
      border: "rgb(117, 94, 78)",
      text: "rgb(252, 246, 236)",
      textSecondary: "rgb(216, 188, 160)",
      accent: "rgb(220, 170, 96)",
      accentSecondary: "rgb(194, 144, 73)",
      success: "rgb(34, 197, 94)",
      warning: "rgb(245, 158, 11)",
      error: "rgb(239, 68, 68)",
      headerAccent: "rgb(220, 170, 96)",
      headerAccentSecondary: "rgb(194, 144, 73)",
      headerText: "rgb(216, 188, 160)",
      headerBackground: "rgb(44, 35, 30)",
    },
  },
];

export const getListedThemes = (): Theme[] =>
  getThemes().filter((theme) => !theme.delisted);
export const getAllThemes = (): Theme[] => getThemes();

const sanitizeThemeId = (themeId?: string): string => {
  const availableIds = new Set(getAllThemes().map((theme) => theme.id));
  if (!themeId || !availableIds.has(themeId)) {
    return "default";
  }
  return themeId;
};

const isValidFont = (fontId: string): fontId is Font =>
  FONT_OPTIONS.some((option) => option.value === fontId);

const sanitizeFontId = (fontId?: string): Font => {
  if (!fontId || !isValidFont(fontId)) {
    return "gabarito-open-sans";
  }
  return fontId;
};

const isLightTheme = (theme: Theme): boolean => {
  const match = theme.colors.background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  return false;
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
  font: "gabarito-open-sans",
  theme: "muted-coral",
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

export const LEGACY_PTIVIS25B_URL =
  "http://lukkari.turkuamk.fi/ical.php?hash=A64E5FCC3647C6FB5D7770DD86526B01FC67BD8A";
export const UPDATED_PTIVIS25B_URL =
  "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8";

const normalizeCalendarUrl = (url: string): string => url.trim();

export const getPresetCalendarName = (url: string): string | null => {
  const preset = PRESET_CALENDARS.find((p) => p.url === url);
  return preset ? preset.label : null;
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

  const sanitizedEntries = Object.entries(config).filter(
    ([, value]) => value !== undefined,
  );
  const sanitizedConfig = Object.fromEntries(
    sanitizedEntries,
  ) as Partial<Config>;

  const mergedConfig: Config = {
    ...defaultConfig,
    ...sanitizedConfig,
  };

  mergedConfig.theme = sanitizeThemeId(mergedConfig.theme);
  mergedConfig.font = sanitizeFontId(mergedConfig.font);

  return mergedConfig;
};

const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: mergeConfigWithDefaults(defaultConfig),
      previousTheme: "muted-coral",
      getThemes,
      getListedThemes,
      getAllThemes,
      setConfig: (partial) =>
        set((state) => ({
          config: mergeConfigWithDefaults({ ...state.config, ...partial }),
        })),
      resetConfig: () =>
        set({
          config: mergeConfigWithDefaults(),
          previousTheme: "muted-coral",
        }),
      getCurrentTheme: () => {
        const { config } = get();
        const themes = getAllThemes();
        return themes.find((theme) => theme.id === config.theme) || themes[0];
      },
      isCurrentThemeLight: () => {
        const currentTheme = get().getCurrentTheme();
        return isLightTheme(currentTheme);
      },
      toggleLightDarkMode: () => {
        set((state) => ({
          config: { ...state.config, theme: "muted-coral" },
          previousTheme: "muted-coral",
        }));
      },
    }),
    {
      name: "app-config",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as
          | { config?: Record<string, unknown> }
          | undefined;

        if (version < 2 && state?.config?.calendarUrl) {
          console.log("Removing legacy calendarUrl from config");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { calendarUrl: _calendarUrl, ...configWithoutUrl } =
            state.config;
          return {
            ...state,
            config: configWithoutUrl,
          };
        }

        return persistedState;
      },
      partialize: (state) => ({
        config: state.config,
        previousTheme: state.previousTheme,
      }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as
          | Partial<ConfigState>
          | undefined;

        return {
          ...currentState,
          ...typedPersisted,
          config: mergeConfigWithDefaults(typedPersisted?.config),
          previousTheme:
            typedPersisted?.previousTheme ?? currentState.previousTheme,
        };
      },
    },
  ),
);

export default useConfigStore;
