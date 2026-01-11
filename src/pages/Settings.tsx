import { motion } from 'framer-motion'
import { Settings as SettingsIcon, GitBranch, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useRef, useState } from 'react'
import useConfigStore from '../state/state-management'
import { SettingsSection } from '../components/ui'
import { SettingsComponentRenderer } from '../components/SettingsComponentRenderer'
import { SettingsNavigation } from '../components/SettingsNavigation'
import { useSettingsConfig } from '../hooks/useSettingsConfig'
import { useActiveSection } from '../hooks/useActiveSection'
import '../components/ui/slider-theme.css'
import type { SettingComponentGroup } from '../types/settings-config'

// SettingGroup component for accordion-style subgroups
function SettingGroup({ group }: { group: SettingComponentGroup }) {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded ?? true)

  return (
    <div className="mt-4 border rounded-lg overflow-hidden transition-colors bg-[var(--color-surface-secondary-alpha-10)] border-[var(--color-border-alpha-30)]">
      {/* Group Header - Accordion Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-surface-secondary-alpha-20)] transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {group.groupName}
          </div>
          {group.groupDescription && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {group.groupDescription}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </button>

      {/* Group Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[var(--color-border-alpha-20)]">
          {group.components.map((component) => (
            <SettingsComponentRenderer
              key={component.id}
              component={component}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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

  useDocumentTitle(`${t('title')} — lukkari.juh.fi`)
  
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
      {/* Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
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
                    {block.components?.map((component) => (
                      <SettingsComponentRenderer 
                        key={component.id} 
                        component={component}
                      />
                    ))}
                    
                    {/* Render groups if they exist */}
                    {block.groups?.map((group, groupIndex) => (
                      <SettingGroup
                        key={groupIndex}
                        group={group}
                      />
                    ))}
                  </SettingsSection>
                </motion.div>
              ))}

              {/* Mobile-only author credit and version info */}
              <div className="lg:hidden text-center py-6 space-y-1">
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                  Open Lukkarikone by Juhani Astikainen
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
                  <GitBranch size={12} />
                  <span>{__GIT_BRANCH__}</span>
                  <span>•</span>
                  <a 
                    href={`https://github.com/juhanias/lukkarikone/commit/${__GIT_COMMIT_HASH__}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: 'inherit' }}
                  >
                    {__GIT_COMMIT_HASH__}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
