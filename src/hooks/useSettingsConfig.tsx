import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Type, RotateCcw, Code, Palette, Calendar, Link, Languages, Sparkles } from 'lucide-react'
import useConfigStore, { useRealizationColorStore } from '../state/state-management'
import { FONT_OPTIONS, type Font } from '../types/config'
import type { SettingsConfig } from '../types/settings-config'

export function useSettingsConfig(): SettingsConfig {
  const { t } = useTranslation('settings')
  const { config, setConfig, resetConfig, getListedThemes } = useConfigStore()
  const { customColors, clearAllCustomColors } = useRealizationColorStore()
  const listedThemes = getListedThemes()

  return useMemo(() => {
    const transformedThemes = listedThemes.map(theme => ({
      id: theme.id,
      name: theme.nameKey ? t(theme.nameKey) : theme.name || theme.id,
      description: theme.descriptionKey ? t(theme.descriptionKey) : theme.description || '',
      colors: {
        background: theme.colors.background,
        surface: theme.colors.surface,
        accent: theme.colors.accent,
        accentSecondary: theme.colors.accentSecondary,
        text: theme.colors.text
      }
    }))
    const settingsConfig: SettingsConfig = [
      // Font Settings
      {
        id: 'font-settings',
        blockName: t('sections.font.title'),
        blockDescription: t('sections.font.subtitle'),
        icon: Type,
        iconColor: '#3b82f6',
        iconBgColor: '#3b82f633',
        components: [
          {
            componentType: 'radio',
            id: 'font-selector',
            data: {
              name: 'font',
              options: FONT_OPTIONS.map((option) => ({
                value: option.value,
                label: t(`sections.font.options.${option.value}.label`),
                subtitle: t(`sections.font.options.${option.value}.subtitle`),
                checked: config.font === option.value
              })),
              onChange: (value) => setConfig({ font: value as Font })
            }
          }
        ]
      },
      
      // View Settings
      {
        id: 'view-settings',
        blockName: t('sections.view.title'),
        blockDescription: t('sections.view.subtitle'),
        icon: Calendar,
        iconColor: '#3b82f6',
        iconBgColor: '#3b82f633',
        components: [
          {
            componentType: 'toggle',
            id: 'show-weekends',
            data: {
              label: t('sections.view.showWeekends.label'),
              subtitle: t('sections.view.showWeekends.subtitle'),
              checked: config.showWeekends,
              onChange: (checked) => setConfig({ showWeekends: checked })
            }
          },
          {
            componentType: 'toggle',
            id: 'show-course-id',
            data: {
              label: t('sections.view.showCourseId.label'),
              subtitle: t('sections.view.showCourseId.subtitle'),
              checked: config.showCourseIdInSchedule,
              onChange: (checked) => setConfig({ showCourseIdInSchedule: checked })
            }
          },
          {
            componentType: 'slider',
            id: 'hidden-event-opacity',
            data: {
              label: t('sections.view.hiddenEventOpacity.label'),
              subtitle: t('sections.view.hiddenEventOpacity.subtitle', { value: config.hiddenEventOpacity }),
              value: config.hiddenEventOpacity,
              min: 5,
              max: 50,
              step: 5,
              unit: '%',
              onChange: (value) => setConfig({ hiddenEventOpacity: value })
            }
          },
          {
            componentType: 'toggle',
            id: 'squeeze-week-on-mobile',
            data: {
              label: t('sections.view.squeezeWeekOnMobile.label'),
              subtitle: t('sections.view.squeezeWeekOnMobile.subtitle'),
              checked: config.squeezeWeekOnMobile,
              onChange: (checked) => setConfig({ squeezeWeekOnMobile: checked })
            }
          }
        ]
      },

      // Language Settings
      {
        id: 'language-settings',
        blockName: t('sections.language.title'),
        blockDescription: t('sections.language.subtitle'),
        icon: Languages,
        iconColor: '#f59e0b',
        iconBgColor: '#f59e0b33',
        components: [
          {
            componentType: 'language-selector',
            id: 'language-selector',
            data: {}
          }
        ]
      },

      // Calendar URL Settings
      {
        id: 'calendar-settings',
        blockName: t('sections.calendar.title'),
        blockDescription: t('sections.calendar.subtitle'),
        icon: Link,
        iconColor: '#10b981',
        iconBgColor: '#10b98133',
        components: [
          {
            componentType: 'calendar-url',
            id: 'calendar-url',
            data: {
              currentUrl: config.calendarUrl,
              urlLabel: t('sections.calendar.urlLabel'),
              configuredText: t('sections.calendar.configured', { 
                url: config.calendarUrl && config.calendarUrl.length > 50 
                  ? config.calendarUrl.substring(0, 47) + '...' 
                  : config.calendarUrl
              }),
              notConfiguredText: t('sections.calendar.notConfigured'),
              editLinkText: t('sections.calendar.editLink'),
              linkCalendarText: t('sections.calendar.linkCalendar')
            }
          }
        ]
      },

      // Styling Settings
      {
        id: 'styling-settings',
        blockName: t('sections.styling.title'),
        blockDescription: t('sections.styling.subtitle'),
        icon: Sparkles,
        iconColor: '#a855f7',
        iconBgColor: '#a855f733',
        components: [
          {
            componentType: 'toggle',
            id: 'enhanced-dialogs',
            data: {
              label: t('sections.styling.enhancedDialogs.label'),
              subtitle: t('sections.styling.enhancedDialogs.subtitle'),
              checked: config.enhancedDialogs,
              onChange: (checked) => setConfig({ enhancedDialogs: checked })
            }
          }
        ]
      },

      // Theme Settings
      {
        id: 'theme-settings',
        blockName: t('sections.theme.title'),
        blockDescription: t('sections.theme.subtitle'),
        icon: Palette,
        iconColor: '#9333ea',
        iconBgColor: '#9333ea33',
        components: [
          {
            componentType: 'theme-selector',
            id: 'theme-selector',
            data: {
              themes: transformedThemes,
              selectedThemeId: config.theme,
              onThemeSelect: (themeId) => setConfig({ theme: themeId })
            }
          }
        ]
      },

      // Actions
      {
        id: 'actions',
        blockName: t('sections.actions.title'),
        blockDescription: t('sections.actions.subtitle'),
        icon: RotateCcw,
        variant: 'danger',
        components: [
          {
            componentType: 'button',
            id: 'reset-config',
            data: {
              label: t('sections.actions.resetButton'),
              subtitle: t('sections.actions.resetSubtitle'),
              onClick: resetConfig,
              variant: 'danger'
            }
          }
        ]
      }
    ]

    // Add debug section only in development
    if (import.meta.env.DEV) {
      settingsConfig.push({
        id: 'debug-settings',
        blockName: t('sections.debug.title'),
        blockDescription: t('sections.debug.subtitle'),
        icon: Code,
        iconColor: 'var(--color-success)',
        iconBgColor: 'var(--color-success-alpha-20)',
        components: [
          {
            componentType: 'custom',
            id: 'debug-info',
            data: {
              render: () => (
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
                        <button
                          onClick={clearAllCustomColors}
                          className="px-3 py-1 text-sm rounded transition-colors"
                          style={{
                            backgroundColor: 'var(--color-danger-alpha-20)',
                            color: 'var(--color-danger)',
                            border: '1px solid var(--color-danger-alpha-30)'
                          }}
                        >
                          Clear All
                        </button>
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
              )
            }
          }
        ]
      })
    }

    // Development tools section - hidden by default, can be revealed via Settings navigation (or visible in DEV)
    if (import.meta.env.DEV || config.devToolsVisible) {
      settingsConfig.push({
        id: 'development-tools',
        blockName: t('sections.development.title') || 'Development tools',
        blockDescription: t('sections.development.subtitle') || 'Temporary developer tools and toggles',
        icon: Code,
        iconColor: '#ef4444',
        iconBgColor: '#ef444433',
        components: [
          {
            componentType: 'toggle',
            id: 'devtools-enable-event-generator',
            data: {
              label: t('sections.development.enableEventGenerator') || 'Enable event generator',
              subtitle: t('sections.development.enableEventGeneratorSubtitle') || 'Allow generating temporary debug events on the schedule',
              checked: config.devToolsEnableEventGenerator || false,
              onChange: (checked: boolean) => setConfig({ devToolsEnableEventGenerator: checked })
            }
          }
        ]
      })
    }

    return settingsConfig
  }, [t, config, setConfig, resetConfig, listedThemes, customColors, clearAllCustomColors])
}
