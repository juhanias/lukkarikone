import { useQueryState } from 'nuqs'

/**
 * Hook for managing event details dialog state via URL query params
 * Usage: ?event=<event-id>
 */
export function useEventDialogParam() {
  return useQueryState('event', {
    clearOnDefault: true,
    history: 'push',
    throttleMs: 50,
  })
}

/**
 * Hook for managing calendar management dialog state via URL query params
 * Usage: ?calendars=true
 */
export function useCalendarsDialogParam() {
  return useQueryState('calendars', {
    defaultValue: null,
    clearOnDefault: true,
    history: 'push',
    throttleMs: 50,
    parse: (value) => (value === 'true' ? 'true' : null),
    serialize: (value) => (value === 'true' ? 'true' : ''),
  })
}

/**
 * Hook for managing theme dialog state via URL query params
 * Usage: ?theme=true
 */
export function useThemeDialogParam() {
  return useQueryState('theme', {
    defaultValue: null,
    clearOnDefault: true,
    history: 'push',
    throttleMs: 50,
    parse: (value) => (value === 'true' ? 'true' : null),
    serialize: (value) => (value === 'true' ? 'true' : ''),
  })
}

/**
 * Hook for managing realization dialog state via URL query params
 * Usage: ?realization=<realization-code>
 */
export function useRealizationDialogParam() {
  return useQueryState('realization', {
    clearOnDefault: true,
    history: 'push',
    throttleMs: 50,
  })
}
