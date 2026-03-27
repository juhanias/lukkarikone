import { Check } from "lucide-react";
import useConfigStore from "../state/state-management";

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

export function ThemeSelector({
  themes,
  selectedThemeId,
  onThemeSelect,
}: ThemeSelectorProps) {
  const { getCurrentTheme } = useConfigStore();
  const currentTheme = getCurrentTheme();
  const normalThemes = themes.filter((theme) => theme.id !== "frog");
  const uhohThemes = themes.filter((theme) => theme.id === "frog");

  // Helper function to convert rgb to rgba with opacity
  const rgbToRgba = (rgb: string, opacity: number): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
    return rgb; // fallback if format doesn't match
  };

  const renderThemeButtons = (groupThemes: Theme[]) => (
    <div className="flex flex-wrap gap-3">
      {groupThemes.map((theme) => {
        const borderColor = theme.colors.accentSecondary || theme.colors.accent;

        return (
          <button
            key={theme.id}
            type="button"
            className="relative cursor-pointer focus:outline-none"
            onClick={() => onThemeSelect(theme.id)}
            aria-label={`Select ${theme.name ?? theme.id} theme`}
          >
            <div
              className="w-12 h-12 rounded-full relative overflow-hidden border-2 transition-colors duration-150"
              style={{
                borderColor:
                  selectedThemeId === theme.id
                    ? currentTheme.colors.accentSecondary
                    : rgbToRgba(borderColor, 0.6),
                boxShadow:
                  selectedThemeId === theme.id
                    ? `0 0 0 3px ${rgbToRgba(currentTheme.colors.accent, 0.3)}`
                    : "none",
              }}
            >
              {/* Gradient background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.background} 45%, ${theme.colors.accent} 55%, ${theme.colors.accent} 100%)`,
                }}
              />

              {/* Checkmark for selected theme */}
              {selectedThemeId === theme.id && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transition: "opacity 0.12s ease" }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
          Themes
        </p>
        {renderThemeButtons(normalThemes)}
      </div>

      {uhohThemes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            uhoh
          </p>
          {renderThemeButtons(uhohThemes)}
        </div>
      )}
    </div>
  );
}
