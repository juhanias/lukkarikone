import type { LucideIcon } from "lucide-react";
import { GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

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
        <h2 className="text-sm font-semibold px-3 mb-2 text-muted-foreground">
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
              type="button"
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg relative group cursor-pointer transition-colors",
                isActive
                  ? "bg-[var(--color-surface-secondary-alpha-30)] text-foreground"
                  : "text-muted-foreground hover:bg-[var(--color-surface-secondary-alpha-20)]",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                    isActive && section.iconColor
                      ? "bg-[color:var(--icon-active-bg)] text-[color:var(--icon-active-fg)]"
                      : "bg-[var(--color-surface-secondary-alpha-30)] text-muted-foreground",
                  )}
                  style={{
                    ...(section.iconColor
                      ? {
                          ["--icon-active-bg" as string]: `${section.iconColor}33`,
                          ["--icon-active-fg" as string]: section.iconColor,
                        }
                      : {}),
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
        <p className="text-xs text-muted-foreground/60">
          Open Lukkarikone by Juhani Astikainen
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
          <GitBranch size={12} />
          <span>{__GIT_BRANCH__}</span>
          <span>•</span>
          <a
            href={`https://github.com/juhanias/lukkarikone/commit/${__GIT_COMMIT_HASH__}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {__GIT_COMMIT_HASH__}
          </a>
        </div>
        <p className="text-xs text-muted-foreground/40">
          {formatCommitDate(__GIT_COMMIT_DATE__)}
        </p>
      </div>
    </div>
  );
}
