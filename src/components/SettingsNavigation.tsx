import type { LucideIcon } from "lucide-react";
import { GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";

// Format commit date to a readable short format
function formatCommitDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

interface SettingsNavigationProps {
  sections: Array<{
    id: string;
    name: string;
    icon:
      | LucideIcon
      | React.ComponentType<{
          className?: string;
          style?: React.CSSProperties;
          size?: number;
        }>;
    iconColor?: string;
  }>;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function SettingsNavigation({
  sections,
  activeSection,
  onSectionClick,
}: SettingsNavigationProps) {
  const { t } = useTranslation("settings");

  return (
    <div className="sticky top-8 space-y-2">
      <div className="mb-4">
        <h2
          className="text-sm font-semibold px-3 mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("navigation.contents")}
        </h2>
      </div>

      <nav className="space-y-1" aria-label="Settings navigation">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className="w-full text-left px-3 py-2 rounded-lg relative group cursor-pointer transition-colors"
              style={{
                backgroundColor: isActive
                  ? "var(--color-surface-secondary-alpha-30)"
                  : "transparent",
                color: isActive
                  ? "var(--color-text)"
                  : "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--color-surface-secondary-alpha-20)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  isActive
                    ? "var(--color-surface-secondary-alpha-30)"
                    : "transparent";
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-colors"
                  style={{
                    backgroundColor:
                      isActive && section.iconColor
                        ? `${section.iconColor}33`
                        : "var(--color-surface-secondary-alpha-30)",
                    color:
                      isActive && section.iconColor
                        ? section.iconColor
                        : "var(--color-text-secondary)",
                  }}
                >
                  <Icon className="w-4 h-4" size={16} />
                </div>
                <span className="text-sm font-medium truncate">
                  {section.name}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                  style={{
                    backgroundColor: section.iconColor || "var(--color-accent)",
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Author credit and version info */}
      <div className="px-3 mt-4 space-y-1">
        <p
          className="text-xs"
          style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
        >
          Open Lukkarikone by Juhani Astikainen
        </p>
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}
        >
          <GitBranch size={12} />
          <span>{__GIT_BRANCH__}</span>
          <span>•</span>
          <a
            href={`https://github.com/juhanias/lukkarikone/commit/${__GIT_COMMIT_HASH__}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "inherit" }}
          >
            {__GIT_COMMIT_HASH__}
          </a>
        </div>
        <p
          className="text-xs"
          style={{ color: "var(--color-text-secondary)", opacity: 0.4 }}
        >
          {formatCommitDate(__GIT_COMMIT_DATE__)}
        </p>
      </div>

      {/* Decorative gradient fade at bottom */}
      <div
        className="h-12 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-background))",
        }}
      />
    </div>
  );
}
