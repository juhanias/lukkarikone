import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useScheduleRange, useScheduleStore } from '../state/state-management'
import useConfigStore from '../state/state-management'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { ScheduleDay, WeekView } from '../components/schedule'
import { CalendarUrlModal } from '../components/CalendarUrlModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { isToday } from 'date-fns'
import { toast } from 'sonner'

const VIEW_MODES = ['day', 'week'] as const

export default function Schedule() {
  const { t, i18n } = useTranslation('schedule')
  const { 
    currentDate, 
    viewMode,
    setViewMode,
    goToPreviousDay, 
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    getWeekStart
  } = useScheduleRange()
  const { 
    getEventsForDate, 
    fetchSchedule, 
    isLoading, 
    isCheckingHash,
    isFetchingCalendar,
    error, 
    clearError,
    lastUpdated
  } = useScheduleStore()
  const { config } = useConfigStore()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const rotateViewMode = useCallback((direction: 'forward' | 'backward') => {
    const currentIndex = VIEW_MODES.indexOf(viewMode)

    if (currentIndex === -1) {
      return
    }

    const step = direction === 'forward' ? 1 : -1
    const nextIndex = (currentIndex + step + VIEW_MODES.length) % VIEW_MODES.length

    setViewMode(VIEW_MODES[nextIndex])
  }, [viewMode, setViewMode])

  // Fetch schedule on component mount
  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // Show toast notification on error
  useEffect(() => {
    if (error) {
      toast.error(t('errors.updateFailed'), {
        description: `${t('errors.updateFailedDescription')} ${t('errors.errorCode')}: ${error}`,
        action: {
          label: t('errors.dismiss'),
          onClick: () => clearError()
        }
      })
    }
  }, [error, clearError, t])

  // Get events for the current date (only for day view)
  const currentEvents = viewMode === 'day' ? getEventsForDate(currentDate) : []

  const lastUpdatedDisplay = useMemo(() => {
    if (!lastUpdated) {
      return null
    }

    try {
      if (isToday(lastUpdated)) {
        const timeFormatter = new Intl.DateTimeFormat(i18n.language, {
          hour: '2-digit',
          minute: '2-digit'
        })
        return t('status.updatedAt', { time: timeFormatter.format(lastUpdated) })
      }

      const dateTimeFormatter = new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
      return t('status.updatedAt', { time: dateTimeFormatter.format(lastUpdated) })
    } catch {
      if (isToday(lastUpdated)) {
        return t('status.updatedAt', { time: lastUpdated.toLocaleTimeString() })
      }
      return t('status.updatedAt', { time: lastUpdated.toLocaleString() })
    }
  }, [lastUpdated, i18n.language, t])

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    if (viewMode === 'day') {
      if (direction === 'left') {
        goToNextDay()
      } else {
        goToPreviousDay()
      }
    } else {
      if (direction === 'left') {
        goToNextWeek()
      } else {
        goToPreviousWeek()
      }
    }

    setTimeout(() => {
      setIsTransitioning(false)
    }, 2)
  }, [isTransitioning, viewMode, goToNextDay, goToPreviousDay, goToNextWeek, goToPreviousWeek])

  const handlePanEnd = (_event: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 50
    const velocity = Math.abs(info.velocity.x)
    const offset = info.offset.x
    
    if (Math.abs(offset) > threshold || velocity > 500) {
      if (offset > 0) {
        handleSwipe('right')
      } else {
        handleSwipe('left')
      }
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      // probably won't happen butttt....
      const activeElement = document.activeElement
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }

      // Ignore if modifier keys are pressed (to allow browser shortcuts)
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return
      }

      // Handle navigation based on view mode
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handleSwipe('right') // Left arrow goes to previous
          break
        case 'ArrowRight':
          event.preventDefault()
          handleSwipe('left') // Right arrow goes to next
          break
        case 'ArrowUp':
        case 'ArrowDown':
          event.preventDefault()
          rotateViewMode(event.key === 'ArrowUp' ? 'backward' : 'forward')
          break
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSwipe, rotateViewMode])

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Calendar URL Configuration Dialog */}
      <Dialog open={!config.calendarUrl} onOpenChange={() => {}}>
        <DialogPortal>
          <DialogOverlay className="backdrop-blur-[20px]" style={{ backgroundColor: 'var(--color-background-alpha-80)' }} />
          <DialogContent showCloseButton={false} className="sm:max-w-[425px]" style={{ fontFamily: `var(--font-${config.font})` }}>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12" style={{ color: 'var(--color-accent)' }} />
              </div>
              <DialogTitle className="text-center" style={{ 
                color: 'var(--color-text)',
                fontFamily: `var(--font-${config.font})`
              }}>
                {t('calendar.urlMissing')}
              </DialogTitle>
              <DialogDescription className="text-center" style={{ 
                color: 'var(--color-text-secondary)',
                fontFamily: `var(--font-${config.font})`
              }}>
                {t('calendar.urlMissingDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 justify-center pt-4">
              <CalendarUrlModal>
                <Button 
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    fontFamily: `var(--font-${config.font})`
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  {t('calendar.linkCalendar')}
                </Button>
              </CalendarUrlModal>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Loading and Error States */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-background-alpha-60)' }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto" style={{
                borderColor: 'var(--color-accent)',
                borderTopColor: 'transparent'
              }}></div>
              <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>{t('loading.schedule')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons - Fixed at top */}
      <div className="flex flex-col border-b" style={{
        backgroundColor: 'var(--color-surface-alpha-40)',
        borderColor: 'var(--color-border-alpha-30)'
      }}>
        {/* View Tabs */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-4">
          <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-surface-secondary-alpha-30)' }}>
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
            >
              {t('navigation.day')}
            </Button>
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
            >
              {t('navigation.week')}
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center p-4">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => handleSwipe('right')}
                disabled={isTransitioning}
                variant="outline"
                size="icon"
                className="p-3 rounded-full disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <ChevronLeft size={20} />
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  if (currentDate.getTime() !== today.getTime()) {
                    setIsTransitioning(true)
                    setTimeout(() => {
                      useScheduleRange.getState().goToToday()
                      setIsTransitioning(false)
                    }, 2)
                  }
                }}
                size="sm"
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-accent-alpha-20)',
                  color: 'var(--color-accent)'
                }}
              >
                {t('navigation.today')}
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => handleSwipe('left')}
                disabled={isTransitioning}
                variant="outline"
                size="icon"
                className="p-3 rounded-full disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <ChevronRight size={20} />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Swipeable Schedule Container */}
      <div className="flex-1 relative">
        <motion.div
          key={viewMode === 'day' ? currentDate.toDateString() : getWeekStart(currentDate).toDateString()} // Key ensures re-render on date/view change
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handlePanEnd}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <div className="h-full overflow-y-auto">
            {viewMode === 'day' ? (
              <ScheduleDay 
                date={currentDate}
                events={currentEvents}
                lastUpdatedLabel={lastUpdatedDisplay}
                isCheckingHash={isCheckingHash}
                isFetchingCalendar={isFetchingCalendar}
                hasError={!!error}
              />
            ) : (
              <WeekView 
                currentDate={currentDate}
                setViewMode={setViewMode}
                lastUpdatedLabel={lastUpdatedDisplay}
                isCheckingHash={isCheckingHash}
                isFetchingCalendar={isFetchingCalendar}
                hasError={!!error}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
