import { memo } from 'react'
import { motion } from 'framer-motion'
import type { ScheduleEvent, GapPeriod } from '../../types/schedule'
import { ScheduleUtils } from '../../utils/schedule-utils'
import { ScheduleLayoutUtils, type PositionedEvent } from '../../utils/schedule-layout-utils'
import { DateFormatUtils } from '../../utils/date-format-utils'
import { START_HOUR, DAY_HOUR_HEIGHT } from '../../constants/schedule-layout-constants'
import { Calendar, Clock } from 'lucide-react'
import { useRealizationDialog } from '../../hooks/useRealizationDialog'
import { useLectureDetailsDialog } from '../../hooks/useLectureDetailsDialog'
import RealizationDialog from '../RealizationDialog'
import LectureDetailsDialog from '../LectureDetailsDialog'

interface ScheduleDayProps {
  date: Date
  events: ScheduleEvent[]
}

const ScheduleDay = memo(({ date, events }: ScheduleDayProps) => {
  // Realization dialog hook
  const { 
    isOpen: realizationDialogOpen,
    isLoading: realizationLoading,
    error: realizationError,
    realizationData,
    openDialog: openRealizationDialog,
    closeDialog: closeRealizationDialog
  } = useRealizationDialog()

  // Lecture details dialog hook
  const {
    isOpen: lectureDetailsDialogOpen,
    selectedEvent,
    openDialog: openLectureDetailsDialog,
    closeDialog: closeLectureDetailsDialog
  } = useLectureDetailsDialog()

  // Function to calculate gap periods between events
  const calculateGapPeriods = (events: ScheduleEvent[]): GapPeriod[] => {
    return ScheduleLayoutUtils.calculateGapPeriods(events)
  }

  // Function to calculate positions for overlapping events
  const calculateEventPositions = (events: ScheduleEvent[]): PositionedEvent[] => {
    return ScheduleLayoutUtils.calculateEventPositions(events)
  }

  // Generate dynamic time slots
  const generateTimeSlots = (events: ScheduleEvent[]): string[] => {
    return ScheduleLayoutUtils.generateTimeSlots(events)
  }

  const formatDate = (date: Date) => {
    return DateFormatUtils.formatDayViewDate(date)
  }

  const positionedEvents = calculateEventPositions(events)
  const gapPeriods = calculateGapPeriods(events)
  const timeSlots = generateTimeSlots(events)
  const dateInfo = formatDate(date)

  // Current time indicator
  const isToday = DateFormatUtils.isToday(date)
  const currentTimeInHours = DateFormatUtils.getCurrentTimeInHours()
  const currentTimeString = DateFormatUtils.getCurrentTimeString()
  const showCurrentTimeIndicator = isToday && currentTimeInHours >= START_HOUR && currentTimeInHours <= (START_HOUR + timeSlots.length)
  const currentTimePosition = showCurrentTimeIndicator ? (currentTimeInHours - START_HOUR) * DAY_HOUR_HEIGHT : 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Date Header - Full Width Gradient */}
      <div className="w-full flex-shrink-0" style={{
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)`
      }}>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>{dateInfo.dayWeek}</div>
          <h2 className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>{dateInfo.fullDate}</h2>
        </div>
      </div>

      {/* Schedule Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 flex flex-col px-4">
          {events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-96" style={{ color: 'var(--color-text-secondary)' }}>
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Ei tapahtumia</p>
              <p className="text-sm opacity-75 mt-1 text-center">Tällä päivällä ei ole merkittyjä tapahtumia / luentoja!</p>
              
              {/* decorative elements for empty state */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-2 text-xs opacity-60">
                  <span>←</span>
                  <span>Pyyhkäise vaihtaaksesi päivää</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative">
              {/* Time Grid - Compact Mobile Version */}
              <div className="space-y-0">
                {timeSlots.map((time, index) => (
                  <div key={time} className="relative border-b last:border-b-0" style={{
                    height: `${DAY_HOUR_HEIGHT}px`,
                    borderColor: 'var(--color-border-alpha-30)'
                  }}>
                    <div className="absolute left-0 top-2 w-14 text-xs font-medium" style={{
                      color: 'var(--color-text-secondary)'
                    }}>
                      {time}
                    </div>
                    <div className="ml-16 h-full relative">
                      {index < timeSlots.length - 1 && (
                        <div className="absolute left-0 top-0 bottom-0 border-l" style={{
                          borderColor: 'var(--color-border-alpha-30)'
                        }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Events Overlay */}
              <div className="absolute inset-0 ml-16">
                {/* Current Time Indicator */}
                {showCurrentTimeIndicator && (
                  <div
                    className="absolute z-20"
                    style={{
                      top: `${currentTimePosition}px`,
                      left: '-4rem', // Extend to include time column
                      right: '-1rem', // Extend to the edge
                      width: 'calc(100% + 5rem)', // Ensure full width coverage
                    }}
                  >
                    {/* Time label */}
                    <div className="absolute left-0 top-0 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center gap-1">
                      <Clock size={12} />
                      {currentTimeString}
                    </div>
                    {/* Line */}
                    <div className="absolute left-14 top-0 h-0.5 bg-red-500 shadow-sm" style={{ right: '1rem' }}></div>
                    {/* Circle at the end */}
                    <div className="absolute top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2 shadow-sm" style={{ right: '1rem' }}></div>
                  </div>
                )}

                {/* Gap Periods */}
                {gapPeriods.map((gap) => (
                  <div
                    key={gap.id}
                    className="absolute flex items-center justify-center text-xs"
                    style={{
                      top: `${(gap.startHour - START_HOUR) * DAY_HOUR_HEIGHT}px`,
                      height: `${gap.duration * DAY_HOUR_HEIGHT}px`,
                      width: '100%',
                      left: '0%',
                      zIndex: 0,
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    <div className="px-2 py-1 rounded text-xs border" style={{
                      backgroundColor: 'var(--color-surface-alpha-40)',
                      borderColor: 'var(--color-border-alpha-30)'
                    }}>
                      {gap.duration.toFixed(1)}h tauko
                    </div>
                  </div>
                ))}
                
                {/* Events */}
                {positionedEvents.map((event) => {
                  const eventDurationInHours = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
                  
                  return (
                    <motion.div
                      key={event.id}
                      className={`absolute rounded-lg ${event.color} text-white shadow-lg cursor-pointer overflow-hidden hover:scale-105 transition-transform duration-200`}
                      style={{
                        top: `${(event.startHour - START_HOUR) * DAY_HOUR_HEIGHT}px`,
                        height: `${event.duration * DAY_HOUR_HEIGHT}px`,
                        width: `${event.width}%`,
                        left: `${event.left}%`,
                        zIndex: event.zIndex,
                        marginLeft: '2px',
                        marginRight: '2px',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // Open lecture details dialog for this event
                        openLectureDetailsDialog(event)
                      }}
                    >
                      {/* Event Time Badge */}
                      <div className="bg-black/20 px-2 py-1 text-xs font-medium">
                        {ScheduleUtils.formatTimeRange(event.startTime, event.endTime)}
                      </div>
                      
                      {/* Event Content */}
                      <div className="p-3 space-y-2">
                        <h3 className={`font-bold leading-tight ${
                          eventDurationInHours < 1.5 ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'
                        }`}>
                          {event.title}
                        </h3>
                        
                        {event.location && (
                          <p className={`text-xs opacity-90 leading-tight ${
                            eventDurationInHours >= 3 ? 'line-clamp-3' : 'line-clamp-2'
                          }`}>
                            📍 {event.location}
                          </p>
                        )}
                        
                        {event.teachers && event.teachers.length > 0 && eventDurationInHours >= 2 && (
                          <p className="text-xs opacity-75 line-clamp-1">
                            👨‍🏫 {event.teachers.join(', ')}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Realization Dialog */}
      <RealizationDialog
        open={realizationDialogOpen}
        onOpenChange={closeRealizationDialog}
        realizationData={realizationData}
        isLoading={realizationLoading}
        error={realizationError}
      />

      {/* Lecture Details Dialog */}
      <LectureDetailsDialog
        open={lectureDetailsDialogOpen}
        onOpenChange={closeLectureDetailsDialog}
        event={selectedEvent}
        onOpenRealizationDialog={openRealizationDialog}
      />
    </div>
  )
})

ScheduleDay.displayName = 'ScheduleDay'

export default ScheduleDay
