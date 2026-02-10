import ICAL from "ical.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScheduleEvent } from "../types/schedule";
import { ScheduleUtils } from "../utils/schedule-utils";
import useCalendarStore from "./calendar-store";
import { useEventMetadataStore } from "./event-metadata-store";
import { useRealizationMetadataStore } from "./realization-metadata-store";

interface ICalCache {
  url: string;
  calendarData: string;
  hash: string;
  lastFetched: Date;
  lastUpdated: Date | null;
}

interface ScheduleState {
  events: ScheduleEvent[];
  calendar: InstanceType<typeof ICAL.Component> | null;
  isLoading: boolean;
  isCheckingHash: boolean;
  isFetchingCalendar: boolean;
  error: string | null;
  lastFetched: Date | null;
  lastUpdated: Date | null;
  icalCaches: Record<string, ICalCache>;
  lastActiveCalendarId: string | null;

  fetchSchedule: () => Promise<void>;
  getEventsForDate: (date: Date) => ScheduleEvent[];
  getEventsForWeek: (weekStart: Date) => { [key: string]: ScheduleEvent[] };
  getEventById: (id: string) => ScheduleEvent | null;
  refreshSchedule: () => Promise<void>;
  clearError: () => void;
  applyEventTimeOverride: (
    eventId: string,
    override: { startTimeIso: string; endTimeIso: string } | null,
    fallbackOriginal?: { startTimeIso: string; endTimeIso: string },
  ) => void;
  getICalCacheInfo: () => {
    url: string;
    lastUpdated: Date | null;
    lastFetched: Date;
  }[];
}

export const useScheduleStore = create<ScheduleState>()(
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

        const activeCalendar = useCalendarStore.getState().getActiveCalendar();
        const currentCalendarId = activeCalendar?.id || null;

        const calendarChanged =
          state.lastActiveCalendarId !== currentCalendarId;

        if (
          !calendarChanged &&
          state.lastFetched &&
          new Date().toDateString() === state.lastFetched.toDateString()
        ) {
          return;
        }

        if (calendarChanged) {
          console.log("Active calendar changed, refreshing...");
          set({
            events: [],
            lastFetched: null,
          });
        }

        const calendarUrls = activeCalendar?.icalUrls || [];

        if (calendarUrls.length === 0) {
          set({
            isLoading: false,
            isCheckingHash: false,
            isFetchingCalendar: false,
          });
          return;
        }

        const hasExistingData = state.events.length > 0;
        set({
          isLoading: !hasExistingData,
          isCheckingHash: true,
          error: null,
        });

        try {
          const { metadataByRealization } =
            useRealizationMetadataStore.getState();
          const eventsByUid = new Map<string, ScheduleEvent>();
          const newIcalCaches: Record<string, ICalCache> = {
            ...state.icalCaches,
          };
          let eventIndexCounter = 0;
          let oldestUpdateTime: Date | null = null;

          for (const url of calendarUrls) {
            try {
              const cachedEntry = state.icalCaches[url];
              let shouldFetch = true;
              let calendarData = "";
              let hash = "";
              let icalLastUpdated: Date | null = null;

              if (cachedEntry && !calendarChanged) {
                try {
                  const { hash: latestHash } =
                    await ScheduleUtils.checkCalendarHash(url);

                  if (cachedEntry.hash === latestHash) {
                    console.log(`Hash matches for ${url} - using cached data`);
                    shouldFetch = false;
                    calendarData = cachedEntry.calendarData;
                    hash = cachedEntry.hash;
                    icalLastUpdated = cachedEntry.lastUpdated;
                  }
                } catch (hashError) {
                  console.error(`Error checking hash for ${url}:`, hashError);
                }
              }

              if (shouldFetch) {
                console.log(`Fetching calendar from ${url}`);
                const result = await ScheduleUtils.retrieveScheduleFromUrl(url);
                calendarData = result.calendarData;
                hash = result.hash;

                const parsedLastUpdated = result.lastUpdated
                  ? new Date(result.lastUpdated)
                  : null;
                icalLastUpdated =
                  parsedLastUpdated && !isNaN(parsedLastUpdated.getTime())
                    ? parsedLastUpdated
                    : null;

                newIcalCaches[url] = {
                  url,
                  calendarData,
                  hash,
                  lastFetched: new Date(),
                  lastUpdated: icalLastUpdated,
                };
              }

              const jcalData = ICAL.parse(calendarData);
              const calendar = new ICAL.Component(jcalData);
              const vevents = calendar.getAllSubcomponents("vevent");

              for (const vevent of vevents) {
                const event = ScheduleUtils.convertToScheduleEvent(
                  vevent,
                  eventIndexCounter++,
                  metadataByRealization,
                );
                if (!eventsByUid.has(event.id)) {
                  eventsByUid.set(event.id, event);
                }
              }

              if (icalLastUpdated) {
                if (!oldestUpdateTime || icalLastUpdated < oldestUpdateTime) {
                  oldestUpdateTime = icalLastUpdated;
                }
              }
            } catch (urlError) {
              console.error(`Error fetching calendar from ${url}:`, urlError);
            }
          }

          const allEvents = Array.from(eventsByUid.values());
          const { metadataByEvent, clearEventTimeOverride } =
            useEventMetadataStore.getState();
          const overriddenEvents = allEvents.map((event) => {
            const override = metadataByEvent[event.id]?.overrides?.time;
            if (!override) {
              return event;
            }
            const currentHash = ScheduleUtils.getEventDefaultHash(
              event.title,
              event.startTime,
              event.endTime,
            );
            if (currentHash !== override.defaultHash) {
              clearEventTimeOverride(event.id);
              return event;
            }
            return ScheduleUtils.applyTimeOverride(
              event,
              override.startTimeIso,
              override.endTimeIso,
            );
          });
          const now = new Date();

          set({
            events: overriddenEvents,
            isLoading: false,
            isCheckingHash: false,
            isFetchingCalendar: false,
            lastFetched: now,
            lastUpdated: oldestUpdateTime,
            icalCaches: newIcalCaches,
            lastActiveCalendarId: currentCalendarId,
          });
        } catch (error) {
          set({
            isLoading: false,
            isCheckingHash: false,
            isFetchingCalendar: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch schedule",
          });
        }
      },

      getEventsForDate: (date: Date) => {
        const { events } = get();
        return events.filter((event) => {
          const eventDate = new Date(event.startTime);
          return eventDate.toDateString() === date.toDateString();
        });
      },

      getEventsForWeek: (weekStart: Date) => {
        const { events } = get();
        const weekEvents: { [key: string]: ScheduleEvent[] } = {};

        for (let i = 0; i < 7; i++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          const dayKey = day.toDateString();
          weekEvents[dayKey] = events.filter((event) => {
            const eventDate = new Date(event.startTime);
            return eventDate.toDateString() === dayKey;
          });
        }

        return weekEvents;
      },

      getEventById: (id: string) => {
        const { events } = get();
        return events.find((event) => event.id === id) || null;
      },

      refreshSchedule: async () => {
        set({ lastFetched: null });
        await get().fetchSchedule();
      },

      clearError: () => set({ error: null }),

      applyEventTimeOverride: (
        eventId,
        override,
        fallbackOriginal,
      ) => {
        set((state) => {
          const existing = state.events.find((event) => event.id === eventId);
          if (!existing) {
            return state;
          }
          if (override) {
            const updated = ScheduleUtils.applyTimeOverride(
              existing,
              override.startTimeIso,
              override.endTimeIso,
            );
            return {
              events: state.events.map((event) =>
                event.id === eventId ? updated : event,
              ),
            };
          }
          const metadataOverride =
            useEventMetadataStore.getState().getEventTimeOverride(eventId);
          const original = metadataOverride
            ? {
                startTimeIso: metadataOverride.originalStartTimeIso,
                endTimeIso: metadataOverride.originalEndTimeIso,
              }
            : fallbackOriginal;
          if (!original) {
            return state;
          }
          const restored = ScheduleUtils.applyTimeOverride(
            existing,
            original.startTimeIso,
            original.endTimeIso,
          );
          return {
            events: state.events.map((event) =>
              event.id === eventId ? restored : event,
            ),
          };
        });
      },

      getICalCacheInfo: () => {
        const state = get();
        return Object.values(state.icalCaches).map((cache) => ({
          url: cache.url,
          lastUpdated: cache.lastUpdated,
          lastFetched: cache.lastFetched,
        }));
      },
    }),
    {
      name: "schedule-storage",
      partialize: (state) => ({
        icalCaches: state.icalCaches,
        lastActiveCalendarId: state.lastActiveCalendarId,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ScheduleState>;

        const icalCaches: Record<string, ICalCache> = {};
        if (persisted.icalCaches) {
          Object.entries(persisted.icalCaches).forEach(([url, cache]) => {
            icalCaches[url] = {
              ...cache,
              lastFetched: cache.lastFetched
                ? new Date(cache.lastFetched)
                : new Date(),
              lastUpdated: cache.lastUpdated
                ? new Date(cache.lastUpdated)
                : null,
            };
          });
        }

        return {
          ...currentState,
          ...persisted,
          icalCaches,
        };
      },
    },
  ),
);

export type { ScheduleState };
