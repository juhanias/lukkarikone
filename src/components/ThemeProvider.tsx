import { useEffect } from 'react';
import useConfigStore from '../state/state-management';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { config, getCurrentTheme } = useConfigStore();

  useEffect(() => {
    const theme = getCurrentTheme();
    const root = document.documentElement;

    // Helper function to convert rgb/rgba to rgba with alpha
    const toRgba = (color: string, alpha: number) => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
      }
      return color;
    };

    // Apply theme colors as CSS custom properties
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-surface-secondary', theme.colors.surfaceSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-accent-secondary', theme.colors.accentSecondary);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    
    // Header-specific colors
    root.style.setProperty('--color-header-accent', theme.colors.headerAccent);
    root.style.setProperty('--color-header-accent-secondary', theme.colors.headerAccentSecondary);
    root.style.setProperty('--color-header-text', theme.colors.headerText);
    root.style.setProperty('--color-header-background', theme.colors.headerBackground);
    
    // Alpha variants
    root.style.setProperty('--color-surface-alpha-40', toRgba(theme.colors.surface, 0.4));
    root.style.setProperty('--color-surface-alpha-60', toRgba(theme.colors.surface, 0.6));
    root.style.setProperty('--color-surface-secondary-alpha-20', toRgba(theme.colors.surfaceSecondary, 0.2));
    root.style.setProperty('--color-surface-secondary-alpha-30', toRgba(theme.colors.surfaceSecondary, 0.3));
    root.style.setProperty('--color-border-alpha-30', toRgba(theme.colors.border, 0.3));
    root.style.setProperty('--color-border-alpha-50', toRgba(theme.colors.border, 0.5));
    root.style.setProperty('--color-accent-alpha-5', toRgba(theme.colors.accent, 0.05));
    root.style.setProperty('--color-accent-alpha-10', toRgba(theme.colors.accent, 0.1));
    root.style.setProperty('--color-accent-alpha-20', toRgba(theme.colors.accent, 0.2));
    root.style.setProperty('--color-accent-alpha-30', toRgba(theme.colors.accent, 0.3));
    root.style.setProperty('--color-accent-alpha-40', toRgba(theme.colors.accent, 0.4));
    root.style.setProperty('--color-success-alpha-20', toRgba(theme.colors.success, 0.2));
    root.style.setProperty('--color-error-alpha-20', toRgba(theme.colors.error, 0.2));
    root.style.setProperty('--color-error-alpha-30', toRgba(theme.colors.error, 0.3));
    root.style.setProperty('--color-error-alpha-40', toRgba(theme.colors.error, 0.4));
    root.style.setProperty('--color-background-alpha-60', toRgba(theme.colors.background, 0.6));
    root.style.setProperty('--color-background-alpha-80', toRgba(theme.colors.background, 0.8));
    
    // Alias danger colors to error colors for compatibility
    root.style.setProperty('--color-danger', theme.colors.error);
    root.style.setProperty('--color-danger-alpha-20', toRgba(theme.colors.error, 0.2));
    root.style.setProperty('--color-danger-alpha-30', toRgba(theme.colors.error, 0.3));
    
    // Header alpha variants
    root.style.setProperty('--color-header-accent-alpha-20', toRgba(theme.colors.headerAccent, 0.2));
    root.style.setProperty('--color-header-accent-alpha-30', toRgba(theme.colors.headerAccent, 0.3));
    
    // RGB variant for slider theming (extract just the RGB part without rgb(...))
    const accentMatch = theme.colors.accent.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (accentMatch) {
      root.style.setProperty('--color-accent-rgb', `${accentMatch[1]}, ${accentMatch[2]}, ${accentMatch[3]}`);
    }

    // Also set the body background
    document.body.style.backgroundColor = theme.colors.background;
    
    // Set the root background as well for consistency
    root.style.backgroundColor = theme.colors.background;
  }, [config.theme, getCurrentTheme]);

  return <>{children}</>;
}
