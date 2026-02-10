import { useQueryState } from "nuqs";

/**
 * Hook for managing event details dialog state via URL query params
 * Usage: ?event=<event-id>
 */
export function useEventDialogParam() {
  return useQueryState<string | null>("event", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => value || null,
  });
}

/**
 * Hook for managing calendar management dialog state via URL query params
 * Usage: ?calendars=true
 */
export function useCalendarsDialogParam() {
  return useQueryState<"true" | null>("calendars", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => (value === "true" ? "true" : null),
    serialize: (value) => (value === "true" ? "true" : ""),
  });
}

/**
 * Hook for managing theme dialog state via URL query params
 * Usage: ?theme=true
 */
export function useThemeDialogParam() {
  return useQueryState<"true" | null>("theme", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => (value === "true" ? "true" : null),
    serialize: (value) => (value === "true" ? "true" : ""),
  });
}

/**
 * Hook for managing realization dialog state via URL query params
 * Usage: ?realization=<realization-code>
 */
export function useRealizationDialogParam() {
  return useQueryState<string | null>("realization", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => value || null,
  });
}

/**
 * Hook for managing event time edit dialog state via URL query params
 * Usage: ?editTime=true
 */
export function useEventTimeEditDialogParam() {
  return useQueryState<"true" | null>("editTime", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => (value === "true" ? "true" : null),
    serialize: (value) => (value === "true" ? "true" : ""),
  });
}

/**
 * Hook for managing color customizer dialog state via URL query params
 * Usage: ?color=<event-id>
 */
export function useColorCustomizerDialogParam() {
  return useQueryState<string | null>("color", {
    defaultValue: null,
    clearOnDefault: true,
    history: "push",
    throttleMs: 50,
    parse: (value) => value || null,
  });
}
