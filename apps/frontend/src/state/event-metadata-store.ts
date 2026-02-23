import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EventMetadata,
  EventMetadataMap,
  EventTimeOverride,
} from "../types/metadata";

const STORAGE_KEY = "event-metadata";
const LEGACY_STORAGE_KEY = "hidden-events";

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

const writeMetadataToStorage = (metadataByEvent: EventMetadataMap) => {
  if (!canAccessStorage()) {
    return false;
  }

  try {
    const payload = {
      state: { metadataByEvent },
      version: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
};

const readLegacyHiddenEvents = (): EventMetadataMap | null => {
  if (!canAccessStorage()) {
    return null;
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) {
    return null;
  }

  try {
    const parsed = JSON.parse(legacy);
    const hiddenEventIds = parsed?.state?.hiddenEventIds ?? [];

    if (!Array.isArray(hiddenEventIds)) {
      return null;
    }

    const metadata: EventMetadataMap = {};
    hiddenEventIds.forEach((eventId) => {
      if (typeof eventId === "string" && eventId.length > 0) {
        metadata[eventId] = { hidden: true };
      }
    });

    return metadata;
  } catch {
    return null;
  }
};

interface EventMetadataState {
  metadataByEvent: EventMetadataMap;
  hasSeenEditWarning: boolean;

  getEventMetadata: (eventId: string) => EventMetadata | undefined;
  setEventMetadata: (eventId: string, metadata: EventMetadata) => void;
  getEventTimeOverride: (eventId: string) => EventTimeOverride | null;
  setEventTimeOverride: (eventId: string, override: EventTimeOverride) => void;
  clearEventTimeOverride: (eventId: string) => void;
  setEventHidden: (eventId: string, hidden: boolean) => void;
  clearEventHidden: (eventId: string) => void;
  getEventColor: (eventId: string) => string | null;
  setEventColor: (eventId: string, color: string) => void;
  clearEventColor: (eventId: string) => void;
  hasEventColor: (eventId: string) => boolean;
  getEventAttachedRealization: (eventId: string) => string | null;
  setEventAttachedRealization: (eventId: string, realizationId: string) => void;
  clearEventAttachedRealization: (eventId: string) => void;
  isEventHidden: (eventId: string) => boolean;
  hideEvent: (eventId: string) => void;
  showEvent: (eventId: string) => void;
  toggleEventVisibility: (eventId: string) => void;
  clearAllEventMetadata: () => void;
  setHasSeenEditWarning: (value: boolean) => void;
}

const initialMetadata = readLegacyHiddenEvents() ?? {};

if (
  canAccessStorage() &&
  !localStorage.getItem(STORAGE_KEY) &&
  Object.keys(initialMetadata).length > 0
) {
  if (writeMetadataToStorage(initialMetadata)) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export const useEventMetadataStore = create<EventMetadataState>()(
  persist(
    (set, get) => ({
      metadataByEvent: initialMetadata,
      hasSeenEditWarning: false,

      getEventMetadata: (eventId: string) => {
        const { metadataByEvent } = get();
        return metadataByEvent[eventId];
      },

      setEventMetadata: (eventId: string, metadata: EventMetadata) => {
        set((state) => ({
          metadataByEvent: {
            ...state.metadataByEvent,
            [eventId]: {
              ...state.metadataByEvent[eventId],
              ...metadata,
            },
          },
        }));
      },

      getEventTimeOverride: (eventId: string) => {
        const { metadataByEvent } = get();
        return metadataByEvent[eventId]?.overrides?.time ?? null;
      },

      setEventTimeOverride: (eventId: string, override: EventTimeOverride) => {
        set((state) => ({
          metadataByEvent: {
            ...state.metadataByEvent,
            [eventId]: {
              ...state.metadataByEvent[eventId],
              overrides: {
                ...state.metadataByEvent[eventId]?.overrides,
                time: override,
              },
            },
          },
        }));
      },

      clearEventTimeOverride: (eventId: string) => {
        set((state) => {
          const existing = state.metadataByEvent[eventId];
          if (!existing?.overrides?.time) {
            return state;
          }
          const { overrides: __, ...restEvent } = existing;
          const { time: _, ...restOverrides } = existing.overrides ?? {};
          const overrides =
            Object.keys(restOverrides).length > 0 ? restOverrides : undefined;
          if (Object.keys(restEvent).length === 0 && !overrides) {
            const { [eventId]: __, ...remaining } = state.metadataByEvent;
            return { metadataByEvent: remaining };
          }
          return {
            metadataByEvent: {
              ...state.metadataByEvent,
              [eventId]: {
                ...restEvent,
                ...(overrides ? { overrides } : {}),
              },
            },
          };
        });
      },

      setEventHidden: (eventId: string, hidden: boolean) => {
        set((state) => ({
          metadataByEvent: {
            ...state.metadataByEvent,
            [eventId]: {
              ...state.metadataByEvent[eventId],
              hidden,
            },
          },
        }));
      },

      clearEventHidden: (eventId: string) => {
        set((state) => {
          const existing = state.metadataByEvent[eventId];
          if (!existing) {
            return state;
          }
          const { hidden: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            const { [eventId]: __, ...remaining } = state.metadataByEvent;
            return { metadataByEvent: remaining };
          }
          return {
            metadataByEvent: {
              ...state.metadataByEvent,
              [eventId]: rest,
            },
          };
        });
      },

      getEventColor: (eventId: string) => {
        const { metadataByEvent } = get();
        return metadataByEvent[eventId]?.color || null;
      },

      setEventColor: (eventId: string, color: string) => {
        set((state) => ({
          metadataByEvent: {
            ...state.metadataByEvent,
            [eventId]: {
              ...state.metadataByEvent[eventId],
              color,
            },
          },
        }));
      },

      clearEventColor: (eventId: string) => {
        set((state) => {
          const existing = state.metadataByEvent[eventId];
          if (!existing) {
            return state;
          }
          const { color: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            const { [eventId]: __, ...remaining } = state.metadataByEvent;
            return { metadataByEvent: remaining };
          }
          return {
            metadataByEvent: {
              ...state.metadataByEvent,
              [eventId]: rest,
            },
          };
        });
      },

      hasEventColor: (eventId: string) => {
        const { metadataByEvent } = get();
        return Boolean(metadataByEvent[eventId]?.color);
      },

      getEventAttachedRealization: (eventId: string) => {
        const { metadataByEvent } = get();
        return metadataByEvent[eventId]?.attachedRealizationId || null;
      },

      setEventAttachedRealization: (eventId: string, realizationId: string) => {
        const normalizedId = realizationId.trim().toLowerCase();
        if (!normalizedId) {
          return;
        }
        set((state) => ({
          metadataByEvent: {
            ...state.metadataByEvent,
            [eventId]: {
              ...(() => {
                const existing = state.metadataByEvent[eventId];
                if (!existing) {
                  return {} as EventMetadata;
                }
                const { color: _, ...rest } = existing;
                return rest;
              })(),
              attachedRealizationId: normalizedId,
            },
          },
        }));
      },

      clearEventAttachedRealization: (eventId: string) => {
        set((state) => {
          const existing = state.metadataByEvent[eventId];
          if (!existing) {
            return state;
          }
          const { attachedRealizationId: _, ...rest } = existing;
          if (Object.keys(rest).length === 0) {
            const { [eventId]: __, ...remaining } = state.metadataByEvent;
            return { metadataByEvent: remaining };
          }
          return {
            metadataByEvent: {
              ...state.metadataByEvent,
              [eventId]: rest,
            },
          };
        });
      },

      isEventHidden: (eventId: string) => {
        const { metadataByEvent } = get();
        return metadataByEvent[eventId]?.hidden === true;
      },

      hideEvent: (eventId: string) => {
        get().setEventHidden(eventId, true);
      },

      showEvent: (eventId: string) => {
        get().clearEventHidden(eventId);
      },

      toggleEventVisibility: (eventId: string) => {
        const { isEventHidden } = get();
        get().setEventHidden(eventId, !isEventHidden(eventId));
      },

      clearAllEventMetadata: () => {
        set({ metadataByEvent: {} });
      },

      setHasSeenEditWarning: (value: boolean) => {
        set({ hasSeenEditWarning: value });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        metadataByEvent: state.metadataByEvent,
        hasSeenEditWarning: state.hasSeenEditWarning,
      }),
    },
  ),
);

useEventMetadataStore.persist?.onFinishHydration?.(() => {
  if (!canAccessStorage()) {
    return;
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    const { metadataByEvent } = useEventMetadataStore.getState();
    if (!writeMetadataToStorage(metadataByEvent)) {
      useEventMetadataStore.setState((state) => ({
        metadataByEvent: { ...state.metadataByEvent },
      }));
    }
  }
});

export type { EventMetadataState };
