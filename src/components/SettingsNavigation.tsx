import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SettingsNavigationProps {
  sections: Array<{
    id: string
    name: string
    icon: LucideIcon | React.ComponentType<{ className?: string; style?: React.CSSProperties; size?: number }>
    iconColor?: string
  }>
  activeSection: string
  onSectionClick: (sectionId: string) => void
}

export function SettingsNavigation({ sections, activeSection, onSectionClick }: SettingsNavigationProps) {
  const { t } = useTranslation('settings')
  
  return (
    <div className="sticky top-8 space-y-2">
      <div className="mb-4">
        <h2 className="text-sm font-semibold px-3 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {t('navigation.contents')}
        </h2>
      </div>
      
      <nav className="space-y-1" aria-label="Settings navigation">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          const Icon = section.icon

          return (
            <motion.button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className="w-full text-left px-3 py-2 rounded-lg relative group cursor-pointer"
              animate={{
                backgroundColor: isActive 
                  ? 'var(--color-surface-secondary-alpha-30)' 
                  : 'transparent',
                color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)'
              }}
              whileHover={{ 
                backgroundColor: isActive 
                  ? 'var(--color-surface-secondary-alpha-30)'
                  : 'var(--color-surface-secondary-alpha-20)',
                x: 2
              }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                  animate={{
                    backgroundColor: isActive && section.iconColor
                      ? `${section.iconColor}33`
                      : 'var(--color-surface-alpha-30)',
                    color: isActive && section.iconColor
                      ? section.iconColor
                      : 'var(--color-text-secondary)'
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon className="w-4 h-4" size={16} />
                </motion.div>
                <span className="text-sm font-medium truncate">
                  {section.name}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{ backgroundColor: section.iconColor || 'var(--color-accent)' }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Decorative gradient fade at bottom */}
      <div 
        className="h-12 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-background))'
        }}
      />
    </div>
  )
}
