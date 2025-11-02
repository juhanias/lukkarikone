import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCalendarStore } from '../state/state-management'
import { CalendarManagementDialog } from './CalendarManagementDialog'

interface CalendarViewBadgeProps {
  variant?: 'full' | 'icon-only'
  className?: string
}

export const CalendarViewBadge = ({ 
  variant = 'full', 
  className = ''
}: CalendarViewBadgeProps) => {
  const { t } = useTranslation('schedule')
  const { getActiveCalendar } = useCalendarStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const activeCalendar = getActiveCalendar()
  const displayText = activeCalendar?.name || t('status.noCalendar', 'No calendar')

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity focus:outline-none ${className}`}
        style={{
          backgroundColor: 'var(--color-surface-secondary-alpha-30)',
          color: 'var(--color-text-secondary)'
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--color-accent)' }} />
        {variant === 'full' && <span>{displayText}</span>}
      </button>

      <CalendarManagementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
