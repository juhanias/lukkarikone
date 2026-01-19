import { Code, RotateCcw, Settings, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDialog } from "../components/CalendarDialog";
import { ThemeDialog } from "../components/ThemeDialog";
import useConfigStore, {
  useRealizationColorStore,
  useSeenCommitsStore,
} from "../state/state-management";
import { FONT_OPTIONS, type Font } from "../types/config";
import type { SettingsConfig } from "../types/settings-config";

export function useSettingsConfig(): SettingsConfig {
  const { t, i18n } = useTranslation("settings");
  const { config, setConfig, resetConfig } = useConfigStore();
  const { customColors, clearAllCustomColors } = useRealizationColorStore();
  const { clearSeenCommits, seenCommits } = useSeenCommitsStore();

  return useMemo(() => {
    const settingsConfig: SettingsConfig = [
      {
        id: "general-settings",
        blockName: t("sections.general.title"),
        blockDescription: t("sections.general.subtitle"),
        icon: Settings,
        iconColor: "#3b82f6",
        iconBgColor: "#3b82f633",
        components: [
          {
            componentType: "custom",
            id: "calendar-management",
            data: {
              render: () => (
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]">
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium text-[var(--color-text)] block">
                      {t("sections.calendar.title")}
                    </label>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {t("sections.calendar.subtitle")}
                    </p>
                  </div>
                  <CalendarDialog />
                </div>
              ),
            },
          },
          {
            componentType: "select",
            id: "language-selector",
            data: {
              label: t("sections.general.language.label"),
              subtitle: t("sections.general.language.subtitle"),
              value: i18n.language,
              options: [
                { value: "en", label: "English" },
                { value: "fi", label: "Suomi" },
              ],
              onChange: (value: string) => {
                i18n.changeLanguage(value);
              },
            },
          },
          {
            componentType: "toggle",
            id: "show-weekends",
            data: {
              label: t("sections.view.showWeekends.label"),
              subtitle: t("sections.view.showWeekends.subtitle"),
              checked: config.showWeekends,
              onChange: (checked) => setConfig({ showWeekends: checked }),
            },
          },
          {
            componentType: "toggle",
            id: "show-course-id",
            data: {
              label: t("sections.view.showCourseId.label"),
              subtitle: t("sections.view.showCourseId.subtitle"),
              checked: config.showCourseIdInSchedule,
              onChange: (checked) =>
                setConfig({ showCourseIdInSchedule: checked }),
            },
          },
          {
            componentType: "slider",
            id: "hidden-event-opacity",
            data: {
              label: t("sections.view.hiddenEventOpacity.label"),
              subtitle: t("sections.view.hiddenEventOpacity.subtitle", {
                value: config.hiddenEventOpacity,
              }),
              value: config.hiddenEventOpacity,
              min: 5,
              max: 50,
              step: 5,
              unit: "%",
              onChange: (value) => setConfig({ hiddenEventOpacity: value }),
            },
          },
          {
            componentType: "toggle",
            id: "show-total-hours",
            data: {
              label: t("sections.view.showTotalHours.label"),
              subtitle: t("sections.view.showTotalHours.subtitle"),
              checked: config.showTotalHours,
              onChange: (checked) => setConfig({ showTotalHours: checked }),
            },
          },
        ],
        groups: [
          {
            groupName: t("sections.general.advancedGroup.title"),
            groupDescription: t("sections.general.advancedGroup.subtitle"),
            defaultExpanded: false,
            components: [
              {
                componentType: "toggle",
                id: "squeeze-week-on-mobile",
                data: {
                  label: t("sections.view.squeezeWeekOnMobile.label"),
                  subtitle: t("sections.view.squeezeWeekOnMobile.subtitle"),
                  checked: config.squeezeWeekOnMobile,
                  onChange: (checked) =>
                    setConfig({ squeezeWeekOnMobile: checked }),
                },
              },
              {
                componentType: "toggle",
                id: "enable-commit-notifications",
                data: {
                  label:
                    t("sections.technical.enableCommitNotifications") ||
                    "Enable commit notifications",
                  subtitle:
                    t("sections.technical.enableCommitNotificationsSubtitle") ||
                    "Show toast notifications when new commits are pushed",
                  checked: config.enableCommitNotifications || false,
                  onChange: (checked: boolean) =>
                    setConfig({ enableCommitNotifications: checked }),
                },
              },
            ],
          },
        ],
      },

      {
        id: "styling-settings",
        blockName: t("sections.styling.title"),
        blockDescription: t("sections.styling.subtitle"),
        icon: Sparkles,
        iconColor: "#a855f7",
        iconBgColor: "#a855f733",
        components: [
          {
            componentType: "select",
            id: "font-selector",
            data: {
              label: t("sections.styling.font.label"),
              subtitle: t("sections.styling.font.subtitle"),
              value: config.font,
              options: FONT_OPTIONS.map((option) => ({
                value: option.value,
                label: t(`sections.font.options.${option.value}.label`),
              })),
              onChange: (value) => setConfig({ font: value as Font }),
            },
          },
          {
            componentType: "custom",
            id: "theme-dialog",
            data: {
              render: () => (
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]">
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium text-[var(--color-text)] block">
                      {t("sections.styling.theme.label")}
                    </label>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {t("sections.styling.theme.subtitle")}
                    </p>
                  </div>
                  <ThemeDialog />
                </div>
              ),
            },
          },
          {
            componentType: "toggle",
            id: "enhanced-dialogs",
            data: {
              label: t("sections.styling.enhancedDialogs.label"),
              subtitle: t("sections.styling.enhancedDialogs.subtitle"),
              checked: config.enhancedDialogs,
              onChange: (checked) => setConfig({ enhancedDialogs: checked }),
            },
          },
          {
            componentType: "button",
            id: "reset-config",
            data: {
              label: t("sections.actions.resetButton"),
              subtitle: t("sections.actions.resetSubtitle"),
              onClick: resetConfig,
              variant: "danger",
              icon: RotateCcw,
            },
          },
        ],
      },
    ];

    // Add debug section only in development
    if (import.meta.env.DEV) {
      settingsConfig.push({
        id: "debug-settings",
        blockName: t("sections.debug.title"),
        blockDescription: t("sections.debug.subtitle"),
        icon: Code,
        iconColor: "var(--color-success)",
        iconBgColor: "var(--color-success-alpha-20)",
        components: [
          {
            componentType: "custom",
            id: "debug-info",
            data: {
              render: () => (
                <div className="space-y-4">
                  {/* App Configuration */}
                  <div>
                    <h4
                      className="text-sm font-semibold mb-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      App Configuration
                    </h4>
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: "var(--color-background-alpha-60)",
                        border: "1px solid var(--color-border-alpha-30)",
                      }}
                    >
                      <pre
                        className="text-sm font-mono overflow-auto"
                        style={{ color: "var(--color-success)" }}
                      >
                        {JSON.stringify(config, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Custom Realization Colors */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        Custom Realization Colors (
                        {Object.keys(customColors).length})
                      </h4>
                      {Object.keys(customColors).length > 0 && (
                        <button
                          onClick={clearAllCustomColors}
                          className="px-3 py-1 text-sm rounded transition-colors"
                          style={{
                            backgroundColor: "var(--color-danger-alpha-20)",
                            color: "var(--color-danger)",
                            border: "1px solid var(--color-danger-alpha-30)",
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: "var(--color-background-alpha-60)",
                        border: "1px solid var(--color-border-alpha-30)",
                      }}
                    >
                      <pre
                        className="text-sm font-mono overflow-auto"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {Object.keys(customColors).length === 0
                          ? "{}"
                          : JSON.stringify(customColors, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ),
            },
          },
        ],
      });
    }

    // Development tools section - hidden by default, can be revealed via Settings navigation (or visible in DEV)
    if (import.meta.env.DEV || config.devToolsVisible) {
      settingsConfig.push({
        id: "development-tools",
        blockName: t("sections.development.title") || "Development tools",
        blockDescription:
          t("sections.development.subtitle") ||
          "Temporary developer tools and toggles",
        icon: Code,
        iconColor: "#ef4444",
        iconBgColor: "#ef444433",
        components: [
          {
            componentType: "toggle",
            id: "devtools-enable-event-generator",
            data: {
              label:
                t("sections.development.enableEventGenerator") ||
                "Enable event generator",
              subtitle:
                t("sections.development.enableEventGeneratorSubtitle") ||
                "Allow generating temporary debug events on the schedule",
              checked: config.devToolsEnableEventGenerator || false,
              onChange: (checked: boolean) =>
                setConfig({ devToolsEnableEventGenerator: checked }),
            },
          },
          {
            componentType: "custom",
            id: "reset-commit-cache",
            data: {
              render: () => (
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text)" }}
                    >
                      {t("sections.development.resetCommitCache") ||
                        "Reset commit cache"}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {t("sections.development.resetCommitCacheSubtitle") ||
                        "Clear seen commits list"}{" "}
                      ({seenCommits.length} commits)
                    </p>
                  </div>
                  <button
                    onClick={clearSeenCommits}
                    className="px-3 py-1.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor:
                        "var(--color-surface-secondary-alpha-30)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border-alpha-30)",
                    }}
                  >
                    Reset
                  </button>
                </div>
              ),
            },
          },
        ],
      });
    }

    return settingsConfig;
  }, [
    t,
    i18n,
    config,
    setConfig,
    resetConfig,
    customColors,
    clearAllCustomColors,
    seenCommits,
    clearSeenCommits,
  ]);
}
