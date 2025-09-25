import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Button } from './button'
import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from './button'

interface ActionButtonProps extends 
  Omit<React.ComponentProps<"button">, 'variant'>,
  Omit<VariantProps<typeof buttonVariants>, 'variant'> {
  onClick: () => void
  variant?: 'primary' | 'danger' | 'subtle'
  disabled?: boolean
  children: ReactNode
}

export function ActionButton({ 
  onClick, 
  variant = 'primary', 
  disabled = false,
  children,
  className,
  size,
  ...props
}: ActionButtonProps) {
  const getShadcnVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive' as const
      case 'subtle':
        return 'secondary' as const
      default:
        return 'default' as const
    }
  }
  
  return (
    <Button
        onClick={onClick}
        disabled={disabled}
        variant={getShadcnVariant()}
        size={size}
        className={className}
        {...props}
      >
        {children}
      </Button>
  )
}
