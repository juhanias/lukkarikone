import { memo } from 'react'
import { useScheduleRange, useScheduleStore, default as useConfigStore } from '../../state/state-management'
import { ScheduleLayoutUtils } from '../../utils/schedule-layout-utils'
import { ScheduleUtils } from '../../utils/schedule-utils'
import { DateFormatUtils } from '../../utils/date-format-utils'
import { WEEK_HOUR_HEIGHT, SCHEDULE_LAYOUT, START_HOUR } from '../../constants/schedule-layout-constants'
import { Calendar, Clock } from 'lucide-react'
import { useRealizationDialog } from '../../hooks/useRealizationDialog'
import { useLectureDetailsDialog } from '../../hooks/useLectureDetailsDialog'
import RealizationDialog from '../RealizationDialog'
import LectureDetailsDialog from '../LectureDetailsDialog'

interface WeekViewProps {
  currentDate: Date
  setViewMode: (mode: 'day' | 'week') => void
}

const WeekView = memo(({ currentDate }: WeekViewProps) => {
  const { getWeekStart, getWeekDates } = useScheduleRange()
  const { getEventsForWeek } = useScheduleStore()
  const { config } = useConfigStore()
  
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
  
  const weekStart = getWeekStart(currentDate)
  const weekDates = getWeekDates(currentDate)
  const weekEvents = getEventsForWeek(weekStart)
  
  // Filter dates and events based on showWeekends config
  const filteredWeekDates = config.showWeekends 
    ? weekDates 
    : weekDates.filter(date => {
        const dayOfWeek = date.getDay()
        return dayOfWeek !== 0 && dayOfWeek !== 6 // Exclude Sunday (0) and Saturday (6)
      })
  
  const filteredWeekEvents = config.showWeekends 
    ? weekEvents
    : Object.fromEntries(
        Object.entries(weekEvents).filter(([dateString]) => {
          const date = new Date(dateString)
          const dayOfWeek = date.getDay()
          return dayOfWeek !== 0 && dayOfWeek !== 6 // Exclude Sunday (0) and Saturday (6)
        })
      )
  
  const filteredDayNames = DateFormatUtils.getDayNamesShort(config.showWeekends)
  
  // Calculate the time range for the week
  const timeSlots = ScheduleLayoutUtils.generateWeekTimeSlots(filteredWeekEvents)
  const totalEventsThisWeek = Object.values(filteredWeekEvents).reduce((sum, dayEvents) => sum + dayEvents.length, 0)

  // Current time indicator
  const currentTimeInHours = DateFormatUtils.getCurrentTimeInHours()
  const currentTimeString = DateFormatUtils.getCurrentTimeString()
  const showCurrentTimeIndicator = filteredWeekDates.some(date => DateFormatUtils.isToday(date)) &&
                                   currentTimeInHours >= START_HOUR && 
                                   timeSlots.length > 0
  const currentTimePosition = showCurrentTimeIndicator ? 
    ((currentTimeInHours - START_HOUR) * WEEK_HOUR_HEIGHT) : 0

  // Format week header
  const formatWeekHeader = () => {
    const startDate = filteredWeekDates[0]
    const endDate = filteredWeekDates[filteredWeekDates.length - 1]
    return DateFormatUtils.formatWeekHeader(startDate, endDate)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Week Header */}
      <div className="w-full flex-shrink-0" style={{
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)`
      }}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            Viikko {DateFormatUtils.getWeekNumber(currentDate)}
          </div>
          <h2 className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>
            {formatWeekHeader()}
          </h2>
        </div>
      </div>

      {/* Week Container */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col px-4">
          {totalEventsThisWeek === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-96" style={{ color: 'var(--color-text-secondary)' }}>
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Ei tapahtumia</p>
              <p className="text-sm opacity-75 mt-1 text-center">Tällä viikolla ei ole merkittyjä tapahtumia!</p>
            </div>
          ) : (
            <div className="flex-1 relative overflow-x-auto">
              {/* Week Grid */}
              <div style={{ minWidth: `${Math.max(320, filteredWeekDates.length * 100 + 48)}px` }}>
                {/* Day Headers */}
                <div className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="flex">
                    <div className="w-12 flex-shrink-0 border-r" style={{ borderColor: 'var(--color-border-alpha-30)' }}>
                    </div>
                    {filteredWeekDates.map((date, index) => (
                      <div key={date.toDateString()} className="flex-1 min-w-24 p-2 text-center border-r last:border-r-0" style={{
                        borderColor: 'var(--color-border-alpha-30)',
                        backgroundColor: date.toDateString() === new Date().toDateString() ? 'var(--color-accent-alpha-20)' : 'transparent'
                      }}>
                        <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          {filteredDayNames[index]}
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: 'var(--color-text)' }}>
                          {date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {/* Current Time Indicator */}
                  {showCurrentTimeIndicator && (
                    <div
                      className="absolute w-full z-30"
                      style={{
                        top: `${currentTimePosition}px`,
                        left: '0',
                        right: '0',
                      }}
                    >
                      {/* Time label */}
                      <div className="absolute left-0 top-0 transform -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm flex items-center gap-1 z-30">
                        <Clock size={10} />
                        {currentTimeString}
                      </div>
                      {/* Line spanning all days */}
                      <div className="absolute left-12 top-0 right-0 h-0.5 bg-red-500 shadow-sm z-20"></div>
                      {/* Individual day indicators for today */}
                      {filteredWeekDates.map((date) => (
                        DateFormatUtils.isToday(date) && (
                          <div
                            key={date.toDateString()}
                            className="absolute top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2 shadow-sm z-20"
                            style={{
                              left: `${12 + (filteredWeekDates.indexOf(date) + 1) * (100 / filteredWeekDates.length)}%`,
                            }}
                          />
                        )
                      ))}
                    </div>
                  )}

                  {timeSlots.map((time, timeIndex) => (
                    <div key={time} className="flex border-b relative" style={{
                      borderColor: 'var(--color-border-alpha-30)',
                      minHeight: `${WEEK_HOUR_HEIGHT}px`
                    }}>
                      {/* Half-hour dashed line */}
                      <div 
                        className="absolute left-0 right-0 border-t border-dashed opacity-75" 
                        style={{
                          borderColor: 'var(--color-border-alpha-30)',
                          top: `${WEEK_HOUR_HEIGHT / 2}px`,
                          zIndex: 5
                        }}
                      />
                      
                      <div className="w-12 flex-shrink-0 p-2 text-xs font-medium border-r" style={{
                        borderColor: 'var(--color-border-alpha-30)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {time}
                      </div>
                      
                      {filteredWeekDates.map((date) => (
                        <div key={date.toDateString()} className="flex-1 min-w-24 relative border-r last:border-r-0" style={{
                          borderColor: 'var(--color-border-alpha-30)'
                        }}>
                          {/* Events for this time slot */}
                          {filteredWeekEvents[date.toDateString()]?.map((event) => {
                            const eventStartHour = event.startHour
                            const slotHour = parseInt(time.split(':')[0])
                            const nextSlotHour = timeIndex < timeSlots.length - 1 ? parseInt(timeSlots[timeIndex + 1].split(':')[0]) : slotHour + 1
                            
                            // Check if event starts in this time slot
                            if (eventStartHour >= slotHour && eventStartHour < nextSlotHour) {
                              const topOffset = ((eventStartHour - slotHour) * WEEK_HOUR_HEIGHT) // WEEK_HOUR_HEIGHT px per hour
                              const height = event.duration * WEEK_HOUR_HEIGHT // WEEK_HOUR_HEIGHT px per hour
                              
                              return (
                                <div
                                  key={event.id}
                                  className={`absolute left-0.5 right-0.5 rounded text-white text-xs p-1 cursor-pointer overflow-hidden ${event.color} hover:z-50 hover:scale-105 transition-transform duration-200`}
                                  style={{
                                    top: `${topOffset}px`,
                                    height: `${Math.max(height, SCHEDULE_LAYOUT.EVENT.MIN_HEIGHT)}px`, // Minimum height
                                    zIndex: 10
                                  }}
                                  onClick={(e) => {
                                    // Prevent the click from causing scroll reset
                                    e.preventDefault()
                                    e.stopPropagation()
                                    
                                    // Open lecture details dialog for this event
                                    openLectureDetailsDialog(event)
                                  }}
                                >
                                  <div className="font-semibold line-clamp-1 leading-tight">
                                    {event.title}
                                  </div>
                                  {event.location && height > 40 && (
                                    <div className="text-xs opacity-90 leading-tight">
                                      📍 {event.location}
                                    </div>
                                  )}
                                  <div className="text-xs opacity-75 line-clamp-1">
                                    {ScheduleUtils.formatTimeRange(event.startTime, event.endTime)}
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
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

WeekView.displayName = 'WeekView'

export default WeekView
