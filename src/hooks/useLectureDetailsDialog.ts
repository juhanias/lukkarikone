import { useState, useCallback } from 'react'
import type { ScheduleEvent } from '../types/schedule'

export const useLectureDetailsDialog = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)

  const openDialog = useCallback((event: ScheduleEvent) => {
    setSelectedEvent(event)
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setSelectedEvent(null)
  }, [])

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