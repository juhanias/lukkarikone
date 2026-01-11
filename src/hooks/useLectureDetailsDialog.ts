import { useCallback } from 'react'
import type { ScheduleEvent } from '../types/schedule'
import { useEventDialogParam } from './useDialogParams'
import { useScheduleStore } from '../state/state-management'

export const useLectureDetailsDialog = () => {
  const [eventId, setEventId] = useEventDialogParam()
  const { getEventById } = useScheduleStore()
  
  const selectedEvent = eventId ? getEventById(eventId) : null
  const isOpen = Boolean(eventId)

  const openDialog = useCallback((event: ScheduleEvent) => {
    setEventId(event.id)
  }, [setEventId])

  const closeDialog = useCallback(() => {
    setEventId(null)
  }, [setEventId])

  const handleEventClick = useCallback((event: ScheduleEvent) => {
    openDialog(event)
    return true // Indicate that we handled the click
  }, [openDialog])

  return {
    isOpen,
    selectedEvent,
    openDialog,
    closeDialog,
    handleEventClick
  }
}

export default useLectureDetailsDialog