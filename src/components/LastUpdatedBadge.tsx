import { Clock3, Info, Loader2, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface LastUpdatedBadgeProps {
  lastUpdatedLabel: string | null
  variant?: 'full' | 'icon-only'
  className?: string
  isCheckingHash?: boolean
  isFetchingCalendar?: boolean
  hasError?: boolean
}

export const LastUpdatedBadge = ({ 
  lastUpdatedLabel, 
  variant = 'full', 
  className = '',
  isCheckingHash = false,
  isFetchingCalendar = false,
  hasError = false
}: LastUpdatedBadgeProps) => {
  const { t } = useTranslation('schedule')

  // Determine which icon to show
  const getIcon = () => {
    if (hasError) {
      return <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--color-warning, rgb(234, 179, 8))' }} />
    }
    if (isCheckingHash || isFetchingCalendar) {
      return <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--color-accent)' }} />
    }
    return <Clock3 className="h-3.5 w-3.5" style={{ color: 'var(--color-accent)' }} />
  }

  // Get loading status text
  const getStatusText = () => {
    if (hasError) {
      return t('status.error', 'Error updating calendar')
    }
    if (isCheckingHash) {
      return t('status.checkingForUpdates', 'Checking for updates...')
    }
    if (isFetchingCalendar) {
      return t('status.fetchingCalendar', 'Loading calendar...')
    }
    return lastUpdatedLabel
  }

  const displayText = getStatusText()

  if (!displayText && !isCheckingHash && !isFetchingCalendar && !hasError) {
    return null
  }

  const BadgeContent = () => (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      style={{
        backgroundColor: hasError 
          ? 'var(--color-warning-alpha-20, rgba(234, 179, 8, 0.2))' 
          : 'var(--color-surface-secondary-alpha-30)',
        color: hasError 
          ? 'var(--color-warning, rgb(234, 179, 8))' 
          : 'var(--color-text-secondary)'
      }}
    >
      {getIcon()}
      {variant === 'full' && <span>{displayText}</span>}
    </div>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-none">
          <BadgeContent />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)'
        }}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
            <div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {hasError ? t('status.errorTitle', 'Error') : t('status.lastRefresh')}
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {displayText}
              </p>
            </div>
          </div>
          {!hasError && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {t('status.refreshInfo')}
            </p>
          )}
          {hasError && lastUpdatedLabel && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {t('status.errorInfo', { time: lastUpdatedLabel })}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
