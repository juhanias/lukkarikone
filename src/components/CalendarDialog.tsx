import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarManagementDialog } from './CalendarManagementDialog'
import { Calendar, ChevronDown } from 'lucide-react'

export function CalendarDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation('settings')

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-2 h-9 px-3 rounded-md border transition-colors w-full sm:w-auto sm:min-w-[180px] cursor-pointer hover:opacity-90"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <span className="flex items-center gap-2 text-sm whitespace-nowrap">
          <Calendar className="w-4 h-4" />
          {t('sections.calendar.manage')}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </button>

      <CalendarManagementDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
