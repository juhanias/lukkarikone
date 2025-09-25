import { motion } from 'framer-motion'
import { Switch } from './switch'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  subtitle?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, subtitle, disabled = false }: ToggleProps) {
  const handleContainerClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleSwitchClick = (e: React.MouseEvent) => {
    // Prevent the container click from firing when clicking directly on the switch
    e.stopPropagation()
  }

  return (
    <motion.div
      className="w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface-secondary-alpha-30)',
        border: '1px solid var(--color-border-alpha-30)'
      }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={handleContainerClick}
    >
      <div className="flex-1">
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div onClick={handleSwitchClick}>
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </motion.div>
  )
}
