import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import useConfigStore from '../state/state-management';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    accent: string;
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
  const currentTheme = getCurrentTheme(); // This now gets fresh theme from source

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme, index) => (
        <motion.button
          key={theme.id}
          className="relative group text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: index * 0.1 }
          }}
          onClick={() => onThemeSelect(theme.id)}
        >
          <div 
            className="relative overflow-hidden rounded-xl border-2 transition-all duration-300"
            style={{
              borderColor: selectedThemeId === theme.id 
                ? currentTheme.colors.accent
                : `${currentTheme.colors.border}80`,
              boxShadow: selectedThemeId === theme.id 
                ? `0 10px 25px -5px ${currentTheme.colors.accent}40, 0 0 0 2px ${currentTheme.colors.accent}80`
                : 'none'
            }}
          >
            {/* Theme Preview */}
            <div 
              className="h-24 relative"
              style={{ backgroundColor: theme.colors.background }}
            >
              {/* Surface layer */}
              <div 
                className="absolute inset-x-2 top-2 bottom-8 rounded-lg"
                style={{ backgroundColor: theme.colors.surface }}
              >
                {/* Accent elements */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <div 
                      className="w-2 h-2 rounded-full opacity-60"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-1 rounded-full opacity-40"
                      style={{ backgroundColor: theme.colors.text }}
                    />
                    <div 
                      className="w-4 h-1 rounded-full opacity-60"
                      style={{ backgroundColor: theme.colors.text }}
                    />
                  </div>
                </div>
                
                {/* Bottom accent bar */}
                <div 
                  className="absolute bottom-2 left-3 right-3 h-1 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              {/* Selection indicator */}
              {selectedThemeId === theme.id && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>

            {/* Theme Info */}
            <div className="p-4 h-32 flex flex-col" style={{ backgroundColor: `${currentTheme.colors.surface}99` }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm" style={{ color: currentTheme.colors.text }}>{theme.name}</h3>
                <Palette className="w-4 h-4 opacity-60 flex-shrink-0" style={{ color: currentTheme.colors.textSecondary }} />
              </div>
              <p className="text-xs leading-relaxed flex-1 overflow-hidden" style={{ color: currentTheme.colors.textSecondary }}>{theme.description}</p>
              
              {/* Color dots */}
              <div className="flex gap-1 mt-3">
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ 
                    backgroundColor: theme.colors.background,
                    borderColor: `${currentTheme.colors.border}80`
                  }}
                  title="Background"
                />
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: `${currentTheme.colors.border}80`
                  }}
                  title="Surface"
                />
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ 
                    backgroundColor: theme.colors.accent,
                    borderColor: `${currentTheme.colors.border}80`
                  }}
                  title="Accent"
                />
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
