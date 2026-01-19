import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HiddenEventsState {
  hiddenEventIds: Set<string>;

  isEventHidden: (eventId: string) => boolean;
  hideEvent: (eventId: string) => void;
  showEvent: (eventId: string) => void;
  toggleEventVisibility: (eventId: string) => void;
  clearAllHiddenEvents: () => void;
}

export const useHiddenEventsStore = create<HiddenEventsState>()(
  persist(
    (set, get) => ({
      hiddenEventIds: new Set<string>(),

      isEventHidden: (eventId: string) => {
        const { hiddenEventIds } = get();
        return hiddenEventIds.has(eventId);
      },

      hideEvent: (eventId: string) => {
        set((state) => {
          const newSet = new Set(state.hiddenEventIds);
          newSet.add(eventId);
          return { hiddenEventIds: newSet };
        });
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
      },
    }),
    {
      name: "hidden-events",
      partialize: (state) => ({
        hiddenEventIds: Array.from(state.hiddenEventIds),
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              hiddenEventIds: new Set(parsed.state.hiddenEventIds || []),
            },
          };
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              hiddenEventIds: Array.from(value.state.hiddenEventIds),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

export type { HiddenEventsState };
