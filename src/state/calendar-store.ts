import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Calendar, CalendarState } from '../types/calendar';
import { migrateCalendarUrl, getPresetCalendarName } from './config-store';

const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      calendars: [],
      activeCalendarId: null,

      addCalendar: (name: string, icalUrls: string[] = []) => {
        const state = get();
        // Find next available index
        const existingIndices = state.calendars
          .map(cal => {
            const match = cal.id.match(/^cal-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => n > 0);
        const nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 1;
        const id = `cal-${nextIndex}`;
        
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
          setTimeout(() => {
            import('./schedule-store').then(m => m.useScheduleStore.getState().refreshSchedule());
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

        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            import('./schedule-store').then(m => m.useScheduleStore.getState().refreshSchedule());
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

        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            import('./schedule-store').then(m => m.useScheduleStore.getState().refreshSchedule());
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

        if (get().activeCalendarId === calendarId) {
          setTimeout(() => {
            import('./schedule-store').then(m => m.useScheduleStore.getState().refreshSchedule());
          }, 0);
        }
      }
    }),
    {
      name: "calendars",
      version: 3,
      partialize: (state) => ({
        calendars: state.calendars,
        activeCalendarId: state.activeCalendarId
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<CalendarState>;
        
        // Version 3: Convert old calendar IDs to index-based format
        if (version < 3 && state.calendars) {
          const calendarsWithOldIds = state.calendars.filter(
            cal => !cal.id.match(/^cal-\d+$/)
          );
          
          if (calendarsWithOldIds.length > 0) {
            console.log('Migrating calendar IDs to index-based format');
            
            // Map old IDs to new IDs
            const idMap = new Map<string, string>();
            const newCalendars = state.calendars.map((cal, index) => {
              const newId = `cal-${index + 1}`;
              idMap.set(cal.id, newId);
              return { ...cal, id: newId };
            });
            
            // Update active calendar ID if it changed
            const newActiveCalendarId = state.activeCalendarId
              ? idMap.get(state.activeCalendarId) || state.activeCalendarId
              : null;
            
            return {
              ...state,
              calendars: newCalendars,
              activeCalendarId: newActiveCalendarId
            };
          }
        }
        
        // Version 2: Migrate from legacy single URL config
        if (version < 2) {
          const configState = localStorage.getItem('app-config');
          if (configState) {
            try {
              const config = JSON.parse(configState);
              const legacyUrl = config?.state?.config?.calendarUrl;

              if (legacyUrl && legacyUrl.trim() && legacyUrl !== 'MIGRATED') {
                const migratedUrl = migrateCalendarUrl(legacyUrl.trim());
                const calendarName = getPresetCalendarName(migratedUrl) || 'Default';
                const now = Date.now();
                const defaultCalendar: Calendar = {
                  id: 'cal-1',
                  name: calendarName,
                  icalUrls: [migratedUrl],
                  createdAt: now,
                  updatedAt: now
                };

                console.log(`Migrating legacy calendar URL to calendar system - wiping existing calendars (name: ${calendarName})`);

                if (config?.state?.config) {
                  config.state.config.calendarUrl = 'MIGRATED';
                  localStorage.setItem('app-config', JSON.stringify(config));
                }

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

export default useCalendarStore;
export type { CalendarState };
