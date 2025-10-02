import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Type, RotateCcw, Code, Palette, Calendar, Link, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useConfigStore, { useRealizationColorStore } from '../state/state-management'
import { ThemeSelector } from '../components/ThemeSelector'
import { FrogIcon } from '../components/FrogIcon'
import LanguageSelector from '../components/LanguageSelector'
import { SettingsSection, Toggle, RadioCard, ActionButton } from '../components/ui'
import { Slider } from '@/components/ui/Slider'
import { CalendarUrlModal } from '../components/CalendarUrlModal'
import { Button } from '@/components/ui/button'
import { FONT_OPTIONS, type Font } from '../types/config'
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
  const { config, setConfig, resetConfig, getListedThemes } = useConfigStore()
  const { customColors, clearAllCustomColors } = useRealizationColorStore()
  const listedThemes = getListedThemes() // Get only the normal themes
  const isFrogMode = config.theme === 'frog'

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header - Full Width Gradient */}
      <div className="w-full" style={{ 
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)` 
      }}>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            backgroundColor: 'var(--color-accent-alpha-20)'
          }}>
            <SettingsIcon className="w-8 h-8" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--color-text)' }}>{t('title')}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('subtitle')}</p>
        </div>
      </div>

      <motion.div 
        className="max-w-4xl mx-auto px-4"
        variants={containerVariants}
        {...motionProps}
      >
        {/* Settings Container */}
        <div className="pb-6 space-y-6">
            {/* Font Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Type}
                title={t('sections.font.title')}
                subtitle={t('sections.font.subtitle')}
              >
                <fieldset className="space-y-4">
                  <legend className="sr-only">{t('sections.font.subtitle')}</legend>
                  {FONT_OPTIONS.map((option) => (
                    <RadioCard
                      key={option.value}
                      name="font"
                      value={option.value}
                      checked={config.font === option.value}
                      onChange={(value) => setConfig({ font: value as Font })}
                      label={t(`sections.font.options.${option.value}.label`)}
                      subtitle={t(`sections.font.options.${option.value}.subtitle`)}
                    />
                  ))}
                </fieldset>
              </SettingsSection>
            </motion.div>

            {/* View Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Calendar}
                iconColor="#3b82f6"
                iconBgColor="#3b82f633"
                title={t('sections.view.title')}
                subtitle={t('sections.view.subtitle')}
              >
                <Toggle
                  checked={config.showWeekends}
                  onChange={(checked) => setConfig({ showWeekends: checked })}
                  label={t('sections.view.showWeekends.label')}
                  subtitle={t('sections.view.showWeekends.subtitle')}
                />
                <motion.div 
                  className="p-4 rounded-lg transition-all mt-4"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary-alpha-30)',
                    border: '1px solid var(--color-border-alpha-30)'
                  }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {t('sections.view.hiddenEventOpacity.label')}
                      </label>
                      <p className="text-xs opacity-75" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('sections.view.hiddenEventOpacity.subtitle', { value: config.hiddenEventOpacity })}
                      </p>
                    </div>
                    <div 
                      className="font-mono text-sm px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border-alpha-30)'
                      }}
                    >
                      {config.hiddenEventOpacity}%
                    </div>
                  </div>
                  <div className="relative">
                    <Slider
                      value={[config.hiddenEventOpacity]}
                      onValueChange={(value) => setConfig({ hiddenEventOpacity: value[0] })}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full opacity-slider-themed"
                    />
                  </div>
                </motion.div>
              </SettingsSection>
            </motion.div>

            {/* Language Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Languages}
                iconColor="#f59e0b"
                iconBgColor="#f59e0b33"
                title={t('sections.language.title')}
                subtitle={t('sections.language.subtitle')}
              >
                <LanguageSelector />
              </SettingsSection>
            </motion.div>

            {/* Calendar URL Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Link}
                iconColor="#10b981"
                iconBgColor="#10b98133"
                title={t('sections.calendar.title')}
                subtitle={t('sections.calendar.subtitle')}
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{t('sections.calendar.urlLabel')}</div>
                      <div className="text-sm opacity-70 break-words">
                        {config.calendarUrl 
                          ? t('sections.calendar.configured', { 
                              url: config.calendarUrl.length > 50 
                                ? config.calendarUrl.substring(0, 47) + '...' 
                                : config.calendarUrl
                            })
                          : t('sections.calendar.notConfigured')
                        }
                      </div>
                    </div>
                    <CalendarUrlModal>
                      <Button 
                        variant="outline"
                        className="flex-shrink-0 w-full sm:w-auto"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                          backgroundColor: 'transparent',
                          fontFamily: `var(--font-${config.font})`
                        }}
                      >
                        {config.calendarUrl ? t('sections.calendar.editLink') : t('sections.calendar.linkCalendar')}
                      </Button>
                    </CalendarUrlModal>
                  </div>
                </div>
              </SettingsSection>
            </motion.div>

            {/* Theme Settings */}
            {!isFrogMode && (
              <motion.div variants={itemVariants}>
                <SettingsSection
                  icon={Palette}
                  iconColor="#9333ea"
                  iconBgColor="#9333ea33"
                  title={t('sections.theme.title')}
                  subtitle={t('sections.theme.subtitle')}
                >
                  <ThemeSelector
                    themes={listedThemes}
                    selectedThemeId={config.theme}
                    onThemeSelect={(themeId) => setConfig({ theme: themeId })}
                  />
                </SettingsSection>
              </motion.div>
            )}

            {/* Frog Mode Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={FrogIcon}
                variant="default"
                title={t('sections.frog.title')}
                subtitle={isFrogMode ? t('sections.frog.subtitleActive') : t('sections.frog.subtitle')}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full flex items-center p-4 rounded-lg cursor-pointer transition-all justify-start h-auto"
                    style={{
                      backgroundColor: isFrogMode
                        ? 'rgba(72, 214, 89, 0.15)'
                        : 'var(--color-surface-secondary-alpha-30)',
                      border: isFrogMode
                        ? '1px solid rgba(72, 214, 89, 0.4)'
                        : '1px solid var(--color-border-alpha-30)'
                    }}
                    onClick={() => setConfig({ theme: isFrogMode ? 'default' : 'frog' })}
                  >
                    <div className="flex-1 text-left">
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {isFrogMode ? t('sections.frog.deactivate') : t('sections.frog.activate')}
                      </span>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {isFrogMode 
                          ? t('sections.frog.deactivateSubtitle')
                          : t('sections.frog.activateSubtitle')
                        }
                      </p>
                    </div>
                    {isFrogMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full ml-4"
                        style={{ backgroundColor: '#48d659' }}
                      />
                    )}
                  </Button>
                </motion.div>
              </SettingsSection>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={RotateCcw}
                variant="danger"
                title={t('sections.actions.title')}
                subtitle={t('sections.actions.subtitle')}
              >
                <ActionButton onClick={resetConfig} variant="danger">
                  {t('sections.actions.resetButton')}
                </ActionButton>
              </SettingsSection>
            </motion.div>

            {import.meta.env.DEV && (
              <motion.div variants={itemVariants}>
                <SettingsSection
                  icon={Code}
                  iconColor="var(--color-success)"
                  iconBgColor="var(--color-success-alpha-20)"
                  title={t('sections.debug.title')}
                  subtitle={t('sections.debug.subtitle')}
                >
                  <div className="space-y-4">
                    {/* App Configuration */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                        App Configuration
                      </h4>
                      <div className="rounded-lg p-4" style={{
                        backgroundColor: 'var(--color-background-alpha-60)',
                        border: '1px solid var(--color-border-alpha-30)'
                      }}>
                        <pre className="text-sm font-mono overflow-auto" style={{ color: 'var(--color-success)' }}>
                          {JSON.stringify(config, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Custom Realization Colors */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          Custom Realization Colors ({Object.keys(customColors).length})
                        </h4>
                        {Object.keys(customColors).length > 0 && (
                          <ActionButton 
                            onClick={clearAllCustomColors} 
                            variant="danger"
                          >
                            Clear All
                          </ActionButton>
                        )}
                      </div>
                      <div className="rounded-lg p-4" style={{
                        backgroundColor: 'var(--color-background-alpha-60)',
                        border: '1px solid var(--color-border-alpha-30)'
                      }}>
                        <pre className="text-sm font-mono overflow-auto" style={{ color: 'var(--color-accent)' }}>
                          {Object.keys(customColors).length === 0 
                            ? '{}' 
                            : JSON.stringify(customColors, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </SettingsSection>
              </motion.div>
            )}
        </div>
      </motion.div>
    </div>
  )
}
