import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ActionButtonProps {
  onClick: () => void
  variant?: 'primary' | 'danger' | 'subtle'
  disabled?: boolean
  children: ReactNode
}

export function ActionButton({ 
  onClick, 
  variant = 'primary', 
  disabled = false,
  children 
}: ActionButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          backgroundColor: 'var(--color-error-alpha-20)',
          color: 'var(--color-error)',
          border: '1px solid var(--color-error-alpha-30)'
        }
      case 'subtle':
        return {
          backgroundColor: 'var(--color-surface-secondary-alpha-30)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border-alpha-30)'
        }
      default:
        return {
          backgroundColor: 'var(--color-accent-alpha-20)',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-accent-alpha-30)'
        }
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 rounded-lg transition-all duration-200 font-medium"
      style={{
        ...getStyles(),
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {children}
    </motion.button>
  )
}
