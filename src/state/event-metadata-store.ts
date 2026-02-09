import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EventMetadata, EventMetadataMap } from "../types/metadata";

const STORAGE_KEY = "event-metadata";
const LEGACY_STORAGE_KEY = "hidden-events";

const canAccessStorage = () => typeof localStorage !== "undefined";

let legacyCleanupPending = false;

const migrateLegacyHiddenEvents = (): EventMetadataMap => {
  if (!canAccessStorage()) {
    return {};
  }

  if (localStorage.getItem(STORAGE_KEY)) {
    return {};
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacy) {
    return {};
  }

  legacyCleanupPending = true;

  try {
    const parsed = JSON.parse(legacy);
    const hiddenEventIds = parsed?.state?.hiddenEventIds ?? [];

    if (!Array.isArray(hiddenEventIds)) {
      return {};
    }

    const metadata: EventMetadataMap = {};
    hiddenEventIds.forEach((eventId) => {
      if (typeof eventId === "string" && eventId.length > 0) {
        metadata[eventId] = { hidden: true };
      }
    });

    return metadata;
  } catch {
    return {};
  }
};

interface EventMetadataState {
  metadataByEvent: EventMetadataMap;

  getEventMetadata: (eventId: string) => EventMetadata | undefined;
  setEventMetadata: (eventId: string, metadata: EventMetadata) => void;
  setEventHidden: (eventId: string, hidden: boolean) => void;
  clearEventHidden: (eventId: string) => void;
  getEventColor: (eventId: string) => string | null;
  setEventColor: (eventId: string, color: string) => void;
  clearEventColor: (eventId: string) => void;
  hasEventColor: (eventId: string) => boolean;
  isEventHidden: (eventId: string) => boolean;
  hideEvent: (eventId: string) => void;
  showEvent: (eventId: string) => void;
  toggleEventVisibility: (eventId: string) => void;
  clearAllEventMetadata: () => void;
}

const initialMetadata = migrateLegacyHiddenEvents();

export const useEventMetadataStore = create<EventMetadataState>()(
  persist(
    (set, get) => ({
      metadataByEvent: initialMetadata,

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
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ metadataByEvent: state.metadataByEvent }),
    },
  ),
);

useEventMetadataStore.persist?.onFinishHydration?.(() => {
  if (!canAccessStorage() || !legacyCleanupPending) {
    return;
  }

  if (!localStorage.getItem(STORAGE_KEY)) {
    useEventMetadataStore.setState((state) => ({
      metadataByEvent: { ...state.metadataByEvent },
    }));
  }

  if (localStorage.getItem(STORAGE_KEY)) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    legacyCleanupPending = false;
  }
});

export type { EventMetadataState };
