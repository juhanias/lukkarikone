import { Clock3, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface LastUpdatedBadgeProps {
  lastUpdatedLabel: string | null
  variant?: 'full' | 'icon-only'
  className?: string
}

export const LastUpdatedBadge = ({ lastUpdatedLabel, variant = 'full', className = '' }: LastUpdatedBadgeProps) => {
  const { t } = useTranslation('schedule')

  if (!lastUpdatedLabel) {
    return null
  }

  const BadgeContent = () => (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      style={{
        backgroundColor: 'var(--color-surface-secondary-alpha-30)',
        color: 'var(--color-text-secondary)'
      }}
    >
      <Clock3 className="h-3.5 w-3.5" style={{ color: 'var(--color-accent)' }} />
      {variant === 'full' && <span>{lastUpdatedLabel}</span>}
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
                {t('status.lastRefresh')}
              </h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {lastUpdatedLabel}
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {t('status.refreshInfo')}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
