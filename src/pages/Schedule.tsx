import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScheduleRange, useScheduleStore } from '../state/state-management'
import useConfigStore from '../state/state-management'
import { ChevronLeft, ChevronRight, CircleX, Calendar } from 'lucide-react'
import { ScheduleDay, WeekView } from '../components/schedule'
import { CalendarUrlModal } from '../components/CalendarUrlModal'
import { Button } from '@/components/ui/button'

export default function Schedule() {
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
    error, 
    clearError 
  } = useScheduleStore()
  const { config } = useConfigStore()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Fetch schedule on component mount
  useEffect(() => {
    fetchSchedule()
  }, [fetchSchedule])

  // Get events for the current date (only for day view)
  const currentEvents = viewMode === 'day' ? getEventsForDate(currentDate) : []

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
    }, 300)
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
          event.preventDefault()
          // Up arrow switches to week view
          if (viewMode === 'day') {
            setViewMode('week')
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          // Down arrow switches to day view
          if (viewMode === 'week') {
            setViewMode('day')
          }
          break
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [viewMode, handleSwipe, setViewMode])

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Calendar URL Configuration Prompt */}
      {!config.calendarUrl && (
        <div className="absolute inset-0 z-50 backdrop-blur-sm flex items-center justify-center"
             style={{ backgroundColor: 'var(--color-background-alpha-80)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-4 p-6 rounded-lg border shadow-lg"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              fontFamily: `var(--font-${config.font})`
            }}
          >
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ 
                color: 'var(--color-text)',
                fontFamily: `var(--font-${config.font})`
              }}>
                Kalenterin URL puuttuu
              </h2>
              <p className="mb-6" style={{ 
                color: 'var(--color-text-secondary)',
                fontFamily: `var(--font-${config.font})`
              }}>
                Määritä Turku AMK:n kalenterijärjestelmän URL-osoite nähdäksesi lukujärjestyksesi.
              </p>
              <div className="flex gap-3 justify-center">
                <CalendarUrlModal>
                  <Button 
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-text)',
                      border: 'none',
                      fontFamily: `var(--font-${config.font})`
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                    Linkkaa kalenteri
                  </Button>
                </CalendarUrlModal>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
              <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>Ladataan lukkaria...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto px-4"
          >
            <div className="rounded-lg p-4 border" style={{
              backgroundColor: 'var(--color-error-alpha-20)',
              borderColor: 'var(--color-error-alpha-30)'
            }}>
              <div className="flex items-start">
                <CircleX 
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                  style={{ color: 'var(--color-error)' }}
                />                  
                
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--color-error)' }}>Lukujärjestyksen lataus epäonnistui</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-error)' }}>{error}</p>
                  <button 
                    onClick={clearError}
                    className="text-sm underline mt-2 hover:opacity-80"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Sulje
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons - Fixed at top */}
      <div className="flex flex-col backdrop-blur-sm border-b" style={{
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)`,
        borderColor: 'var(--color-border-alpha-30)'
      }}>
        {/* View Tabs */}
        <div className="w-full max-w-4xl mx-auto px-4 pt-4">
          <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--color-surface-secondary-alpha-30)' }}>
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                viewMode === 'day' 
                  ? 'shadow-sm' 
                  : ''
              }`}
              style={{
                backgroundColor: viewMode === 'day' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'day' ? 'white' : 'var(--color-text-secondary)'
              }}
            >
              Päivä
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week' 
                  ? 'shadow-sm' 
                  : ''
              }`}
              style={{
                backgroundColor: viewMode === 'week' ? 'var(--color-accent)' : 'transparent',
                color: viewMode === 'week' ? 'white' : 'var(--color-text-secondary)'
              }}
            >
              Viikko
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center p-4">
          <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
            <motion.button 
              onClick={() => handleSwipe('right')}
              disabled={isTransitioning}
              className="p-3 rounded-full transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-surface-secondary-alpha-30)',
                color: 'var(--color-text-secondary)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <motion.button
              onClick={() => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                if (currentDate.getTime() !== today.getTime()) {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    useScheduleRange.getState().goToToday()
                    setIsTransitioning(false)
                  }, 150)
                }
              }}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-accent-alpha-20)',
                color: 'var(--color-accent)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tänään
            </motion.button>
            
            <motion.button 
              onClick={() => handleSwipe('left')}
              disabled={isTransitioning}
              className="p-3 rounded-full transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-surface-secondary-alpha-30)',
                color: 'var(--color-text-secondary)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={20} />
            </motion.button>
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
              />
            ) : (
              <WeekView 
                currentDate={currentDate}
                setViewMode={setViewMode}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
