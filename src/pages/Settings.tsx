import { motion } from 'framer-motion'
import { Settings as SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRef } from 'react'
import useConfigStore from '../state/state-management'
import { SettingsSection } from '../components/ui'
import { SettingsComponentRenderer } from '../components/SettingsComponentRenderer'
import { SettingsNavigation } from '../components/SettingsNavigation'
import { useSettingsConfig } from '../hooks/useSettingsConfig'
import { useActiveSection } from '../hooks/useActiveSection'
import '../components/ui/slider-theme.css'


// Animation variants moved to module scope to prevent recreation
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false

const motionProps = prefersReducedMotion 
  ? { initial: 'visible', animate: 'visible' }
  : { initial: 'hidden', animate: 'visible' }

export default function Settings() {
  const { t } = useTranslation('settings')
  const settingsConfig = useSettingsConfig()
  
  // Filter visible blocks
  const visibleBlocks = settingsConfig.filter(block => !block.condition || block.condition())
  
  // Extract section IDs for scroll tracking
  const sectionIds = visibleBlocks.map(block => block.id)
  const { activeSection, scrollToSection } = useActiveSection(sectionIds)
  
  // Prepare navigation data
  const navigationSections = visibleBlocks.map(block => ({
    id: block.id,
    name: block.blockName,
    icon: block.icon,
    iconColor: block.iconColor
  }))

  // Secret click counter: clicking the Actions icon 5 times reveals the development tools section
  const actionsClickRef = useRef(0)
  const { setConfig } = useConfigStore()

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'actions') {
      actionsClickRef.current += 1
      if (actionsClickRef.current >= 5) {
        setConfig({ devToolsVisible: true })
        actionsClickRef.current = 0
      } else {
        // reset counter after 2 seconds of inactivity
        setTimeout(() => { actionsClickRef.current = 0 }, 2000)
      }
    }
    scrollToSection(sectionId)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header - Full Width Gradient */}
      <div className="w-full" style={{ 
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)` 
      }}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            backgroundColor: 'var(--color-accent-alpha-20)'
          }}>
            <SettingsIcon className="w-8 h-8" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--color-text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('subtitle')}</p>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-8 pb-6">
          {/* Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <SettingsNavigation
                sections={navigationSections}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
              />
          </aside>

          {/* Main Settings Content */}
          <motion.div 
            className="flex-1 min-w-0"
            variants={containerVariants}
            {...motionProps}
          >
            <div className="space-y-6">
              {visibleBlocks.map((block) => (
                <motion.div key={block.id} id={block.id} variants={itemVariants}>
                  <SettingsSection
                    icon={block.icon}
                    iconColor={block.iconColor}
                    iconBgColor={block.iconBgColor}
                    variant={block.variant}
                    title={block.blockName}
                    subtitle={block.blockDescription}
                  >
                    {block.components.map((component) => (
                      <SettingsComponentRenderer 
                        key={component.id} 
                        component={component}
                      />
                    ))}
                  </SettingsSection>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
