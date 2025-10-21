import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import useConfigStore from '../state/state-management';

interface Theme {
  id: string;
  nameKey?: string;
  descriptionKey?: string;
  name?: string;
  description?: string;
  colors: {
    background: string;
    surface: string;
    accent: string;
    accentSecondary: string;
    text: string;
  };
}

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
}

export function ThemeSelector({ themes, selectedThemeId, onThemeSelect }: ThemeSelectorProps) {
  const { getCurrentTheme } = useConfigStore();
  const currentTheme = getCurrentTheme();

  // Helper function to convert rgb to rgba with opacity
  const rgbToRgba = (rgb: string, opacity: number): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
    return rgb; // fallback if format doesn't match
  };

  return (
    <div className="flex flex-wrap gap-3">
      {themes.map((theme) => {
        const borderColor = theme.colors.accentSecondary || theme.colors.accent;
        
        return (
          <motion.button
            key={theme.id}
            className="relative cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeSelect(theme.id)}
            aria-label={`Select ${theme.id} theme`}
          >
            <div 
              className="w-12 h-12 rounded-full relative overflow-hidden border-2 transition-all duration-200"
              style={{
                borderColor: selectedThemeId === theme.id 
                  ? currentTheme.colors.accentSecondary
                  : rgbToRgba(borderColor, 0.6),
                boxShadow: selectedThemeId === theme.id 
                  ? `0 0 0 3px ${rgbToRgba(currentTheme.colors.accent, 0.3)}`
                  : 'none'
              }}
            >
              {/* Gradient background */}
              <div 
                className="absolute inset-0"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.background} 45%, ${theme.colors.accent} 55%, ${theme.colors.accent} 100%)`
                }}
              />
              
              {/* Checkmark for selected theme */}
              {selectedThemeId === theme.id && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
