import { useQueryState } from "nuqs";

/**
 * Hook for managing schedule date via URL query params
 * Usage: ?date=2026-01-11
 */
export function useDateParam() {
  return useQueryState("date", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    parse: (value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : value;
    },
  });
}

/**
 * Hook for managing schedule view mode via URL query params
 * Usage: ?view=day or ?view=week or ?view=month
 */
export function useViewModeParam() {
  return useQueryState<"day" | "week" | "month">("view", {
    defaultValue: "week",
    clearOnDefault: true,
    history: "push",
    parse: (value) => {
      if (value === "day" || value === "week" || value === "month") {
        return value;
      }
      return "week";
    },
  });
}

/**
 * Hook for onboarding step in schedule flow
 * Usage: ?onboardingStep=calendar or ?onboardingStep=theme
 */
export function useOnboardingStepParam() {
  return useQueryState<"calendar" | "theme">("onboardingStep", {
    defaultValue: "calendar",
    clearOnDefault: true,
    history: "push",
    parse: (value) => {
      if (value === "calendar" || value === "theme") {
        return value;
      }
      return "calendar";
    },
  });
}

/**
 * Hook for onboarding calendar mode
 * Usage: ?onboardingMode=groups or ?onboardingMode=custom
 */
export function useOnboardingModeParam() {
  return useQueryState<"groups" | "custom">("onboardingMode", {
    defaultValue: "groups",
    clearOnDefault: true,
    history: "push",
    parse: (value) => {
      if (value === "groups" || value === "custom") {
        return value;
      }
      return "groups";
    },
  });
}
