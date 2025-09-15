import { motion } from 'framer-motion'

interface RadioCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  label: string
  subtitle?: string
  disabled?: boolean
}

export function RadioCard({ 
  name, 
  value, 
  checked, 
  onChange, 
  label, 
  subtitle,
  disabled = false 
}: RadioCardProps) {
  return (
    <motion.label 
      className="flex items-center p-4 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: 'var(--color-surface-secondary-alpha-30)',
        border: '1px solid var(--color-border-alpha-30)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.value)}
        disabled={disabled}
        className="w-4 h-4 mr-4"
        style={{ accentColor: 'var(--color-accent)' }}
        aria-describedby={subtitle ? `${name}-${value}-desc` : undefined}
      />
      <div className="flex-1">
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
        {subtitle && (
          <p id={`${name}-${value}-desc`} className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {checked && (
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
      )}
    </motion.label>
  )
}
