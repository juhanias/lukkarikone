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
  showNames?: boolean;
}

export function ThemeSelector({
  themes,
  selectedThemeId,
  onThemeSelect,
  showNames = false,
}: ThemeSelectorProps) {
  const { getCurrentTheme } = useConfigStore();
  const currentTheme = getCurrentTheme();
  const normalThemes = themes.filter((theme) => theme.id !== "frog");
  const uhohThemes = themes.filter((theme) => theme.id === "frog");

  const rgbToRgba = (rgb: string, opacity: number): string => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
    }
    return rgb;
  };

  const renderThemeButtons = (groupThemes: Theme[]) => (
    <div
      className={
        showNames
          ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
          : "flex flex-wrap gap-3"
      }
    >
      {groupThemes.map((theme) => {
        const isSelected = selectedThemeId === theme.id;
        const borderColor = theme.colors.accentSecondary || theme.colors.accent;

        return (
          <button
            key={theme.id}
            type="button"
            className={
              showNames
                ? "w-full rounded-lg border p-3 text-left flex items-center justify-between cursor-pointer transition-colors"
                : "relative cursor-pointer focus:outline-none"
            }
            onClick={() => onThemeSelect(theme.id)}
            aria-label={`Select ${theme.name ?? theme.id} theme`}
            style={
              showNames
                ? {
                    backgroundColor: isSelected
                      ? "var(--color-accent-alpha-20)"
                      : "var(--color-surface-secondary-alpha-20)",
                    borderColor: isSelected
                      ? "var(--color-accent)"
                      : "var(--color-border-alpha-30)",
                    color: "var(--color-text)",
                  }
                : undefined
            }
          >
            {showNames ? (
              <>
                <span className="font-medium min-w-0 flex-1 pr-2 break-words leading-tight">
                  {theme.name ?? theme.id}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="h-4 w-4 rounded-full border"
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderColor: theme.colors.accentSecondary,
                    }}
                  />
                  {isSelected && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: "var(--color-accent)" }}
                    />
                  )}
                </span>
              </>
            ) : (
              <div
                className="w-12 h-12 rounded-full relative overflow-hidden border-2 transition-colors duration-150"
                style={{
                  borderColor: isSelected
                    ? currentTheme.colors.accentSecondary
                    : rgbToRgba(borderColor, 0.6),
                  boxShadow: isSelected
                    ? `0 0 0 3px ${rgbToRgba(currentTheme.colors.accent, 0.3)}`
                    : "none",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.background} 45%, ${theme.colors.accent} 55%, ${theme.colors.accent} 100%)`,
                  }}
                />

                {isSelected && (
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
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {!showNames && (
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
            Themes
          </p>
        )}
        {renderThemeButtons(normalThemes)}
      </div>

      {uhohThemes.length > 0 && (
        <div className="space-y-2">
          <p
            className={
              showNames
                ? "text-sm font-medium text-[var(--color-text-secondary)]"
                : "text-xs font-semibold text-[var(--color-text-secondary)]"
            }
          >
            uhoh
          </p>
          {renderThemeButtons(uhohThemes)}
        </div>
      )}
    </div>
  );
}
