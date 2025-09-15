import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Type, RotateCcw, Code, Palette, Calendar, Link } from 'lucide-react'
import useConfigStore from '../state/state-management'
import { ThemeSelector } from '../components/ThemeSelector'
import { FrogIcon } from '../components/FrogIcon'
import { SettingsSection, Toggle, RadioCard, ActionButton } from '../components/ui'
import { CalendarUrlModal } from '../components/CalendarUrlModal'
import { Button } from '@/components/ui/button'
import { FONT_OPTIONS, type Font } from '../types/config'

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
  const { config, setConfig, resetConfig, getListedThemes } = useConfigStore()
  const listedThemes = getListedThemes() // Get only the normal themes
  const isFrogMode = config.theme === 'frog'

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header - Full Width Gradient */}
      <div className="w-full flex-shrink-0" style={{ 
        background: `linear-gradient(to bottom, var(--color-surface-alpha-40), transparent)` 
      }}>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            backgroundColor: 'var(--color-accent-alpha-20)'
          }}>
            <SettingsIcon className="w-8 h-8" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-light mb-2" style={{ color: 'var(--color-text)' }}>Asetukset</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Mukauta sovelluksen ulkoasua ja toimintoja</p>
        </div>
      </div>

      {/* Settings Container - Constrained Width */}
      <div className="flex-1 overflow-y-auto">
        <motion.div 
          className="max-w-4xl mx-auto px-4 py-6"
          variants={containerVariants}
          {...motionProps}
        >
          <div className="space-y-6">
            {/* Font Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Type}
                title="Fonttiasetukset"
                subtitle="Valitse sovelluksen fontti"
              >
                <fieldset className="space-y-4">
                  <legend className="sr-only">Valitse fontti</legend>
                  {FONT_OPTIONS.map((option) => (
                    <RadioCard
                      key={option.value}
                      name="font"
                      value={option.value}
                      checked={config.font === option.value}
                      onChange={(value) => setConfig({ font: value as Font })}
                      label={option.label}
                      subtitle={option.subtitle}
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
                title="Näkymäasetukset"
                subtitle="Mukauta kalenterinäkymää"
              >
                <Toggle
                  checked={config.showWeekends}
                  onChange={(checked) => setConfig({ showWeekends: checked })}
                  label="Näytä viikonloput"
                  subtitle="Näytä lauantai ja sunnuntai viikkonäkymässä"
                />
              </SettingsSection>
            </motion.div>

            {/* Calendar URL Settings */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={Link}
                iconColor="#10b981"
                iconBgColor="#10b98133"
                title="Kalenteriasetukset"
                subtitle="Määritä kalenterisi URL-osoite"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Kalenterin URL</div>
                      <div className="text-sm opacity-70">
                        {config.calendarUrl 
                          ? `Määritetty: ${config.calendarUrl.length > 50 
                              ? config.calendarUrl.substring(0, 47) + '...' 
                              : config.calendarUrl}`
                          : 'Ei määritetty - kalenteri ei toimi ilman URL:ää'
                        }
                      </div>
                    </div>
                    <CalendarUrlModal>
                      <Button 
                        variant="outline"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)',
                          backgroundColor: 'transparent',
                          fontFamily: `var(--font-${config.font})`
                        }}
                      >
                        {config.calendarUrl ? 'Muokkaa linkkiä' : 'Linkkaa kalenteri'}
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
                  title="Teema-asetukset"
                  subtitle="Valitse sovelluksen värimaailma"
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
                title="🐸 mode"
                subtitle={isFrogMode ? '🐸🐸🐸' : 'aktivoi 🐸-moodi elääksesi villisti'}
              >
                <motion.button
                  className="w-full flex items-center p-4 rounded-lg cursor-pointer transition-all"
                  style={{
                    backgroundColor: isFrogMode
                      ? 'rgba(72, 214, 89, 0.15)'
                      : 'var(--color-surface-secondary-alpha-30)',
                    border: isFrogMode
                      ? '1px solid rgba(72, 214, 89, 0.4)'
                      : '1px solid var(--color-border-alpha-30)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfig({ theme: isFrogMode ? 'default' : 'frog' })}
                >
                  <div className="flex-1 text-left">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {isFrogMode ? 'Poistu sammakkotilasta' : 'Aktivoi 🐸-tila'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      {isFrogMode 
                        ? 'Palaa takaisin normaaliin teemaan'
                        : 'aktivoi 🐸-moodi elääksesi villisti. voit kyllä palata takaisin jos kaduttaa'
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
                </motion.button>
              </SettingsSection>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants}>
              <SettingsSection
                icon={RotateCcw}
                variant="danger"
                title="Toiminnot"
                subtitle="Palauta oletusasetukset"
              >
                <ActionButton onClick={resetConfig} variant="danger">
                  Palauta oletusasetukset
                </ActionButton>
              </SettingsSection>
            </motion.div>

            {/* Debug Configuration Display - Development only */}
            {import.meta.env.DEV && (
              <motion.div variants={itemVariants}>
                <SettingsSection
                  icon={Code}
                  iconColor="var(--color-success)"
                  iconBgColor="var(--color-success-alpha-20)"
                  title="Konfiguraatio"
                  subtitle="Nykyiset asetukset (kehittäjille)"
                >
                  <div className="rounded-lg p-4" style={{
                    backgroundColor: 'var(--color-background-alpha-60)',
                    border: '1px solid var(--color-border-alpha-30)'
                  }}>
                    <pre className="text-sm font-mono overflow-auto" style={{ color: 'var(--color-success)' }}>
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                </SettingsSection>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
