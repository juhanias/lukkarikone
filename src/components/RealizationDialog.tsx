import { motion } from 'framer-motion'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog'
import { Calendar, Clock, MapPin, Users, GraduationCap, BookOpen, Info } from 'lucide-react'

interface RealizationData {
  name: string
  code: string
  teaching_language: string
  scope_amount: string
  evaluation_scale: string
  gname: string
  office: string
  start_date: string
  end_date: string
  enrollment_start_date: string
  enrollment_end_date: string
  teacher: string
  tgroup: string
  learning_material: string
  further_information: string
  events: Array<{
    event_id: number
    start_date: string
    end_date: string
    subject: string
    location?: Array<{
      class: string
      name: string
      parent: string
    }>
    reserved_for: string[]
    student_groups: string[]
  }>
}

interface RealizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  realizationData: RealizationData | null
  isLoading: boolean
  error: string | null
}

const RealizationDialog = ({
  open,
  onOpenChange,
  realizationData,
  isLoading,
  error
}: RealizationDialogProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fi-FI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLocationString = (location?: Array<{ class: string; name: string; parent: string }>) => {
    if (!location || location.length === 0) return null
    return location.map(loc => `${loc.name} (${loc.class})`).join(', ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
        width: '90vw',
        maxWidth: '1200px'
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <GraduationCap className="h-6 w-6" />
            Toteutustiedot
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--color-text-secondary)' }}>
            Yksityiskohtaiset tiedot opintojakson toteutuksesta
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8" style={{ color: 'var(--color-text)' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
            <span className="ml-3">Ladataan toteutustietoja...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-4 border" style={{
            backgroundColor: 'var(--color-error-alpha-20)',
            borderColor: 'var(--color-error-alpha-40)'
          }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--color-error)' }}>
              <Info className="h-5 w-5" />
              <span className="font-medium">Virhe</span>
            </div>
            <p className="mt-2" style={{ color: 'var(--color-error)' }}>{error}</p>
          </div>
        )}

        {realizationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="rounded-lg p-4 border" style={{
              backgroundColor: 'var(--color-accent-alpha-20)',
              borderColor: 'var(--color-accent-alpha-40)'
            }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {realizationData.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <BookOpen className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                  <span><strong>Koodi:</strong> {realizationData.code}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <span><strong>Opetuskieli:</strong> {realizationData.teaching_language}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <span><strong>Laajuus:</strong> {realizationData.scope_amount} op</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <span><strong>Arviointiasteikko:</strong> {realizationData.evaluation_scale}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                  <span><strong>Kampus:</strong> {realizationData.office}</span>
                </div>
              </div>
            </div>

            {/* Duration & Enrollment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Calendar className="h-4 w-4" />
                  Toteutusaika
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Alkaa:</strong> {formatDate(realizationData.start_date)}<br />
                  <strong>Päättyy:</strong> {formatDate(realizationData.end_date)}
                </p>
              </div>
              
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Clock className="h-4 w-4" />
                  Ilmoittautuminen
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong>Alkaa:</strong> {formatDate(realizationData.enrollment_start_date)}<br />
                  <strong>Päättyy:</strong> {formatDate(realizationData.enrollment_end_date)}
                </p>
              </div>
            </div>

            {/* Teachers & Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <GraduationCap className="h-4 w-4" />
                  Opettajat
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {realizationData.teacher.split(';').map(teacher => teacher.trim()).join(', ')}
                </p>
              </div>
              
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Users className="h-4 w-4" />
                  Opiskelijaryhmät
                </h4>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {realizationData.tgroup.split(';').map(group => group.trim()).join(', ')}
                </p>
              </div>
            </div>

            {/* Learning Materials */}
            {realizationData.learning_material && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <BookOpen className="h-4 w-4" />
                  Oppimateriaali
                </h4>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                  {realizationData.learning_material}
                </p>
              </div>
            )}

            {/* Further Information */}
            {realizationData.further_information && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Info className="h-4 w-4" />
                  Lisätietoja
                </h4>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                  {realizationData.further_information}
                </p>
              </div>
            )}

            {/* Events Summary */}
            {realizationData.events && realizationData.events.length > 0 && (
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'var(--color-surface-alpha-40)',
                borderColor: 'var(--color-border-alpha-30)'
              }}>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Calendar className="h-4 w-4" />
                  Tulevat tapahtumat ({realizationData.events.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {realizationData.events.slice(0, 5).map((event) => (
                    <div key={event.event_id} className="text-sm p-2 rounded border" style={{
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border-alpha-30)'
                    }}>
                      <div className="font-medium">{formatDateTime(event.start_date)}</div>
                      <div className="text-xs opacity-90">
                        {getLocationString(event.location) && (
                          <span>📍 {getLocationString(event.location)}</span>
                        )}
                        {event.reserved_for.length > 0 && (
                          <span className="ml-2">👨‍🏫 {event.reserved_for.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {realizationData.events.length > 5 && (
                    <div className="text-xs text-center py-1" style={{ color: 'var(--color-text-secondary)' }}>
                      ... ja {realizationData.events.length - 5} muuta tapahtumaa
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default RealizationDialog