import { useQueryState } from 'nuqs'

/**
 * Hook for managing schedule date via URL query params
 * Usage: ?date=2026-01-11
 */
export function useDateParam() {
  return useQueryState('date', {
    defaultValue: null,
    clearOnDefault: true,
    history: 'push',
    parse: (value) => {
      if (!value) return null
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : value
    },
  })
}

/**
 * Hook for managing schedule view mode via URL query params
 * Usage: ?view=day or ?view=week
 */
export function useViewModeParam() {
  return useQueryState<'day' | 'week'>('view', {
    defaultValue: 'week',
    clearOnDefault: true,
    history: 'push',
    parse: (value) => {
      if (value === 'day' || value === 'week') return value
      return 'week'
    },
  })
}
