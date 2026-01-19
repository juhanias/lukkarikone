import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "day" | "week";

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

export const useScheduleRange = create<ScheduleRangeState>()(
  persist(
    (set, get) => ({
      currentDate: new Date(),
      viewMode: "day",
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
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
      },
      getWeekDates: (date?: Date) => {
        const weekStart = get().getWeekStart(date);
        const dates = [] as Date[];
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
    },
  ),
);

export type { ViewMode };
