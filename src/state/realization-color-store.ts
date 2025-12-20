import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ScheduleUtils } from '../utils/schedule-utils';

interface RealizationColorState {
  customColors: Record<string, string>;

  getRealizationColor: (realizationCode: string) => string;
  setRealizationColor: (realizationCode: string, color: string) => void;
  resetRealizationColor: (realizationCode: string) => void;
  clearAllCustomColors: () => void;
  hasCustomColor: (realizationCode: string) => boolean;
}

export const useRealizationColorStore = create<RealizationColorState>()(
  persist(
    (set, get) => ({
      customColors: {},

      getRealizationColor: (realizationCode: string) => {
        const { customColors } = get();
        if (customColors[realizationCode]) {
          return customColors[realizationCode];
        }
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

export type { RealizationColorState };
