import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog'
import { ActionButton } from './ui/ActionButton'
import { Calendar, Clock, MapPin, Users, GraduationCap, BookOpen, Info, ExternalLink } from 'lucide-react'
import type { ScheduleEvent } from '../types/schedule'
import { RealizationApiService } from '../services/realizationApi'

interface LectureDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ScheduleEvent | null
  onOpenRealizationDialog?: (eventTitle: string) => void
}

const LectureDetailsDialog = ({
  open,
  onOpenChange,
  event,
  onOpenRealizationDialog
}: LectureDetailsDialogProps) => {
  const { t } = useTranslation('dialogs')
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fi-FI', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fi-FI', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDurationString = (duration: number) => {
    const hours = Math.floor(duration)
    const minutes = Math.round((duration - hours) * 60)
    
    if (hours === 0) return `${minutes} min`
    if (minutes === 0) return `${hours} h`
    return `${hours} h ${minutes} min`
  }

  const handleOpenRealizationDialog = () => {
    if (event && onOpenRealizationDialog) {
      onOpenRealizationDialog(event.title)
    }
  }

  const displayTitle = event
    ? (() => {
        const baseTitle = RealizationApiService.stripRealizationCode(event.title)
        const realizationCode = RealizationApiService.extractRealizationCode(event.title)
        if (!realizationCode) {
          return baseTitle
        }
        const codeForDisplay = realizationCode.toUpperCase()
        return `${baseTitle} ${codeForDisplay}`.trim()
      })()
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        width: '90vw',
        maxWidth: '600px'
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <BookOpen className="h-6 w-6" />
            {t('lectureDetailsDialog.title')}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--color-text-secondary)' }}>
            {t('lectureDetailsDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {event && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Course Title */}
            <div className="rounded-lg p-4 border" style={{
              backgroundColor: 'var(--color-accent-alpha-20)',
              borderColor: 'var(--color-accent-alpha-40)'
            }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {displayTitle}
              </h3>
              {event.description && (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {event.description}
                </p>
              )}
            </div>

            {/* Time and Date Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Calendar className="h-4 w-4" />
                  {t('lectureDetailsDialog.date')}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(event.startTime)}
                </p>
              </div>
              
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Clock className="h-4 w-4" />
                  {t('lectureDetailsDialog.time')}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  <br />
                  <span className="text-xs opacity-75">
                    {t('lectureDetailsDialog.duration')}: {getDurationString(event.duration)}
                  </span>
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <MapPin className="h-4 w-4" />
                  {t('lectureDetailsDialog.location')}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {event.location}
                </p>
              </div>
            )}

            {/* Teachers */}
            {event.teachers && event.teachers.length > 0 && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <GraduationCap className="h-4 w-4" />
                  {t('lectureDetailsDialog.teachers')}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {event.teachers.join(', ')}
                </p>
              </div>
            )}

            {/* Student Groups */}
            {event.groups && event.groups.length > 0 && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Users className="h-4 w-4" />
                  {t('lectureDetailsDialog.studentGroups')}
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {event.groups.join(', ')}
                </p>
              </div>
            )}

            {/* Action Button for Realization Dialog */}
            {event.title && RealizationApiService.hasRealizationCode(event.title) && onOpenRealizationDialog && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-alpha-30)' }}>
                <ActionButton
                  onClick={handleOpenRealizationDialog}
                  variant="primary"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {t('lectureDetailsDialog.showRealizationDetails')}
                  </div>
                </ActionButton>
              </div>
            )}

            {/* Info about missing realization data */}
            {event.title && !RealizationApiService.hasRealizationCode(event.title) && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <Info className="h-4 w-4" />
                  <span className="text-sm">
                    {t('lectureDetailsDialog.noRealizationData')}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LectureDetailsDialog