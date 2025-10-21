import type { LucideIcon } from 'lucide-react'
import type React from 'react'

export type SettingComponentType = 
  | 'toggle'
  | 'radio'
  | 'slider'
  | 'button'
  | 'custom'
  | 'language-selector'
  | 'theme-selector'
  | 'calendar-url'

export interface BaseComponentConfig {
  componentType: SettingComponentType
  id: string
}

export interface ToggleComponentConfig extends BaseComponentConfig {
  componentType: 'toggle'
  data: {
    label: string
    subtitle: string
    checked: boolean
    onChange: (checked: boolean) => void
  }
}

export interface RadioComponentConfig extends BaseComponentConfig {
  componentType: 'radio'
  data: {
    name: string
    options: Array<{
      value: string
      label: string
      subtitle: string
      checked: boolean
    }>
    onChange: (value: string) => void
  }
}

export interface SliderComponentConfig extends BaseComponentConfig {
  componentType: 'slider'
  data: {
    label: string
    subtitle: string
    value: number
    min: number
    max: number
    step: number
    unit?: string
    onChange: (value: number) => void
  }
}

export interface ButtonComponentConfig extends BaseComponentConfig {
  componentType: 'button'
  data: {
    label: string
    subtitle?: string
    onClick: () => void
    variant?: 'default' | 'danger' | 'outline'
    icon?: LucideIcon
  }
}

export interface CustomComponentConfig extends BaseComponentConfig {
  componentType: 'custom'
  data: {
    render: () => React.ReactNode
  }
}

export interface LanguageSelectorConfig extends BaseComponentConfig {
  componentType: 'language-selector'
  data: Record<string, never> // No additional data needed
}

export interface ThemeSelectorConfig extends BaseComponentConfig {
  componentType: 'theme-selector'
  data: {
    themes: Array<{ 
      id: string
      name: string
      description: string
      colors: {
        background: string
        surface: string
        accent: string
        accentSecondary: string
        text: string
      }
    }>
    selectedThemeId: string
    onThemeSelect: (themeId: string) => void
  }
}

export interface CalendarUrlConfig extends BaseComponentConfig {
  componentType: 'calendar-url'
  data: {
    currentUrl?: string
    urlLabel: string
    configuredText: string
    notConfiguredText: string
    editLinkText: string
    linkCalendarText: string
  }
}

export type SettingComponent = 
  | ToggleComponentConfig
  | RadioComponentConfig
  | SliderComponentConfig
  | ButtonComponentConfig
  | CustomComponentConfig
  | LanguageSelectorConfig
  | ThemeSelectorConfig
  | CalendarUrlConfig

export interface SettingsBlock {
  id: string
  blockName: string
  blockDescription: string
  icon: LucideIcon | React.ComponentType<{ className?: string; style?: React.CSSProperties; size?: number }>
  iconColor?: string
  iconBgColor?: string
  variant?: 'default' | 'danger'
  components: SettingComponent[]
  condition?: () => boolean // Optional condition to show/hide the block
}

export type SettingsConfig = SettingsBlock[]
