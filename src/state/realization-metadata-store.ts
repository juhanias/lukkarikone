import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RealizationMetadata,
  RealizationMetadataMap,
} from "../types/metadata";
import { ScheduleUtils } from "../utils/schedule-utils";

const STORAGE_KEY = "realization-metadata";
const LEGACY_STORAGE_KEY = "realization-colors";

const writeMetadataToStorage = (
  metadataByRealization: RealizationMetadataMap,
) => {
  if (!canAccessStorage()) {
    return false;
  }

  try {
    const payload = {
      state: { metadataByRealization },
      version: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

const readLegacyRealizationColors = (): RealizationMetadataMap | null => {
  if (!canAccessStorage()) {
    return null;
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) {
    return null;
  }

  try {
    const parsed = JSON.parse(legacy);
    const customColors =
      parsed?.state?.customColors ?? parsed?.customColors ?? {};

    if (!customColors || typeof customColors !== "object") {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }

    const metadata: RealizationMetadataMap = {};
    Object.entries(customColors).forEach(([realizationCode, color]) => {
      if (typeof color === "string" && color.length > 0) {
        metadata[realizationCode] = { color };
      }
    });

    return metadata;
  } catch {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
};

const canAccessStorage = () => {
  try {
    if (typeof localStorage === "undefined") {
      return false;
    }
    localStorage.getItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

interface RealizationMetadataState {
  metadataByRealization: RealizationMetadataMap;

  getRealizationMetadata: (
    realizationCode: string,
  ) => RealizationMetadata | undefined;
  getRealizationColor: (realizationCode: string) => string;
  isRealizationHidden: (realizationCode: string) => boolean;
  hideRealization: (realizationCode: string) => void;
  showRealization: (realizationCode: string) => void;
  setRealizationMetadata: (
    realizationCode: string,
    metadata: RealizationMetadata,
  ) => void;
  setRealizationColor: (realizationCode: string, color: string) => void;
  clearRealizationColor: (realizationCode: string) => void;
  clearAllRealizationMetadata: () => void;
  hasRealizationColor: (realizationCode: string) => boolean;
}

const initialMetadata = readLegacyRealizationColors() ?? {};

if (
  canAccessStorage() &&
  !localStorage.getItem(STORAGE_KEY) &&
  Object.keys(initialMetadata).length > 0
) {
  if (writeMetadataToStorage(initialMetadata)) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export const useRealizationMetadataStore = create<RealizationMetadataState>()(
  persist(
    (set, get) => ({
      metadataByRealization: initialMetadata,

      getRealizationMetadata: (realizationCode: string) => {
        const { metadataByRealization } = get();
        return metadataByRealization[realizationCode];
      },

      getRealizationColor: (realizationCode: string) => {
        const { metadataByRealization } = get();
        const metadata = metadataByRealization[realizationCode];
        if (metadata?.color) {
          return metadata.color;
        }
        return ScheduleUtils.getDefaultRealizationColor(realizationCode);
      },

      isRealizationHidden: (realizationCode: string) => {
        const { metadataByRealization } = get();
        return Boolean(metadataByRealization[realizationCode]?.hidden);
      },

      hideRealization: (realizationCode: string) => {
        set((state) => ({
          metadataByRealization: {
            ...state.metadataByRealization,
            [realizationCode]: {
              ...state.metadataByRealization[realizationCode],
              hidden: true,
            },
          },
        }));
      },

      showRealization: (realizationCode: string) => {
        set((state) => {
          const existing = state.metadataByRealization[realizationCode];
          if (!existing) {
            return state;
          }
          const { hidden: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            const { [realizationCode]: __, ...remaining } =
              state.metadataByRealization;
            return { metadataByRealization: remaining };
          }
          return {
            metadataByRealization: {
              ...state.metadataByRealization,
              [realizationCode]: rest,
            },
          };
        });
      },

      setRealizationMetadata: (
        realizationCode: string,
        metadata: RealizationMetadata,
      ) => {
        set((state) => ({
          metadataByRealization: {
            ...state.metadataByRealization,
            [realizationCode]: {
              ...state.metadataByRealization[realizationCode],
              ...metadata,
            },
          },
        }));
      },

      setRealizationColor: (realizationCode: string, color: string) => {
        set((state) => ({
          metadataByRealization: {
            ...state.metadataByRealization,
            [realizationCode]: {
              ...state.metadataByRealization[realizationCode],
              color,
            },
          },
        }));
      },

      clearRealizationColor: (realizationCode: string) => {
        set((state) => {
          const existing = state.metadataByRealization[realizationCode];
          if (!existing) {
            return state;
          }
          const { color: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            const { [realizationCode]: __, ...remaining } =
              state.metadataByRealization;
            return { metadataByRealization: remaining };
          }
          return {
            metadataByRealization: {
              ...state.metadataByRealization,
              [realizationCode]: rest,
            },
          };
        });
      },

      clearAllRealizationMetadata: () => {
        set({ metadataByRealization: {} });
      },

      hasRealizationColor: (realizationCode: string) => {
        const { metadataByRealization } = get();
        return Boolean(metadataByRealization[realizationCode]?.color);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        metadataByRealization: state.metadataByRealization,
      }),
    },
  ),
);

useRealizationMetadataStore.persist?.onFinishHydration?.(() => {
  if (!canAccessStorage()) {
    return;
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    const { metadataByRealization } = useRealizationMetadataStore.getState();
    if (!writeMetadataToStorage(metadataByRealization)) {
      useRealizationMetadataStore.setState((state) => ({
        metadataByRealization: { ...state.metadataByRealization },
      }));
    }
  }
});

export type { RealizationMetadataState };
