import { motion } from 'framer-motion'
import { useState } from 'react'
import { Toggle, RadioCard } from './ui'
import { Slider } from './ui/Slider'
import LanguageSelector from './LanguageSelector'
import { ThemeSelector } from './ThemeSelector'
import { CalendarUrlModal } from './CalendarUrlModal'
import { CalendarManagementDialog } from './CalendarManagementDialog'
import { Button } from './ui/button'
import type { SettingComponent } from '../types/settings-config'
import useConfigStore from '../state/state-management'

interface SettingsComponentRendererProps {
  component: SettingComponent
}

export function SettingsComponentRenderer({ component }: SettingsComponentRendererProps) {
  const { config } = useConfigStore()
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false)
  
  switch (component.componentType) {
    case 'toggle':
      return (
        <Toggle
          checked={component.data.checked}
          onChange={component.data.onChange}
          label={component.data.label}
          subtitle={component.data.subtitle}
        />
      )

    case 'radio':
      return (
        <fieldset className="space-y-4">
          <legend className="sr-only">{component.data.name}</legend>
          {component.data.options.map((option) => (
            <RadioCard
              key={option.value}
              name={component.data.name}
              value={option.value}
              checked={option.checked}
              onChange={component.data.onChange}
              label={option.label}
              subtitle={option.subtitle}
            />
          ))}
        </fieldset>
      )

    case 'slider':
      return (
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
            <div className="flex-1 min-w-0 mr-4">
              <label className="font-medium" style={{ color: 'var(--color-text)' }}>
                {component.data.label}
              </label>
              <p className="text-xs mt-1 opacity-75 max-w-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                {component.data.subtitle}
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
              {component.data.value}{component.data.unit || ''}
            </div>
          </div>
          <div className="relative">
            <Slider
              value={[component.data.value]}
              onValueChange={(value) => component.data.onChange(value[0])}
              min={component.data.min}
              max={component.data.max}
              step={component.data.step}
              className="w-full opacity-slider-themed"
            />
          </div>
        </motion.div>
      )

    case 'button': {
      return (
        <motion.div
          className="w-full flex items-center p-4 rounded-lg cursor-pointer transition-all"
          style={{
            backgroundColor: component.data.variant === 'danger'
              ? 'rgba(239, 68, 68, 0.15)'
              : 'var(--color-surface-secondary-alpha-30)',
            border: component.data.variant === 'danger'
              ? '1px solid rgba(239, 68, 68, 0.4)'
              : '1px solid var(--color-border-alpha-30)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={component.data.onClick}
          role="button"
          tabIndex={0}
        >
          <div className="flex-1">
            <span className="font-medium block" style={{ 
              color: component.data.variant === 'danger' ? '#ef4444' : 'var(--color-text)'
            }}>
              {component.data.label}
            </span>
            {component.data.subtitle && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                {component.data.subtitle}
              </p>
            )}
          </div>
        </motion.div>
      )
    }

    case 'language-selector':
      return <LanguageSelector />

    case 'theme-selector':
      return (
        <ThemeSelector
          themes={component.data.themes}
          selectedThemeId={component.data.selectedThemeId}
          onThemeSelect={component.data.onThemeSelect}
        />
      )

    case 'calendar-url':
      return (
        <>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{component.data.urlLabel}</div>
                <div className="text-sm opacity-70 break-words">
                  {component.data.currentUrl 
                    ? component.data.configuredText
                    : component.data.notConfiguredText
                  }
                </div>
              </div>
              {/* Use CalendarManagementDialog if calendar exists, CalendarUrlModal for first setup */}
              {component.data.currentUrl ? (
                <Button 
                  variant="outline"
                  className="flex-shrink-0 w-full sm:w-auto"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                    backgroundColor: 'transparent',
                    fontFamily: `var(--font-${config.font})`
                  }}
                  onClick={() => setIsCalendarDialogOpen(true)}
                >
                  {component.data.editLinkText}
                </Button>
              ) : (
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
                    {component.data.linkCalendarText}
                  </Button>
                </CalendarUrlModal>
              )}
            </div>
          </div>
          
          {component.data.currentUrl && (
            <CalendarManagementDialog
              open={isCalendarDialogOpen}
              onOpenChange={setIsCalendarDialogOpen}
            />
          )}
        </>
      )

    case 'custom':
      return <>{component.data.render()}</>

    default:
      return null
  }
}
