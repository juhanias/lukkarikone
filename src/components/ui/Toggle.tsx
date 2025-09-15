import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  subtitle?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, subtitle, disabled = false }: ToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="w-full flex items-center justify-between p-4 rounded-lg transition-all text-left"
      style={{
        backgroundColor: 'var(--color-surface-secondary-alpha-30)',
        border: '1px solid var(--color-border-alpha-30)'
      }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className="flex-1">
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div 
        className={`w-12 h-6 rounded-full transition-all duration-300 ${checked ? '' : 'opacity-50'}`} 
        style={{
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-surface-secondary)'
        }}
      >
        <div 
          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 mt-1 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </div>
    </motion.button>
  )
}
