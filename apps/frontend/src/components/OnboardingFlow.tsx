import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Link as LinkIcon,
  ListChecks,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useOnboardingModeParam,
  useOnboardingStepParam,
} from "@/hooks/useScheduleParams";
import {
  PRESET_CALENDAR_GROUPS,
  PRESET_CALENDARS,
} from "@/lib/preset-calendars";
import {
  useCalendarStore,
  useConfigStore,
  useScheduleStore,
} from "@/state/state-management";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { t } = useTranslation("schedule");
  const { t: tSettings } = useTranslation("settings");
  const { addCalendar, getActiveCalendar } = useCalendarStore();
  const { clearError, refreshSchedule } = useScheduleStore();
  const { config, setConfig, getListedThemes } = useConfigStore();

  const [onboardingStep, setOnboardingStep] = useOnboardingStepParam();
  const [onboardingMode, setOnboardingMode] = useOnboardingModeParam();

  const hasCalendar = Boolean(getActiveCalendar());
  const currentStep = onboardingStep === "theme" && hasCalendar ? 2 : 1;
  const showCustomUrl = onboardingMode === "custom";
  const [inputUrl, setInputUrl] = useState("");
  const [error, setError] = useState("");
  const stageKey = `${onboardingStep}:${onboardingMode}`;

  useEffect(() => {
    if (onboardingStep === "theme" && !hasCalendar) {
      void setOnboardingStep("calendar");
    }
  }, [onboardingStep, hasCalendar, setOnboardingStep]);

  useEffect(() => {
    if (!stageKey) {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stageKey]);

  const listedThemes = getListedThemes();
  const activeStepIndex = currentStep - 1;

  const validateUrl = (url: string) => {
    const trimmed = url.trim();

    if (!trimmed) {
      return t("onboarding.validation.required");
    }

    try {
      new URL(trimmed);
    } catch {
      return t("onboarding.validation.invalid");
    }

    if (!trimmed.toLowerCase().includes("turkuamk.fi")) {
      return t("onboarding.validation.mustBeTurkuAmk");
    }

    return "";
  };

  const applyCalendarUrl = async (calendarUrl: string) => {
    const trimmedUrl = calendarUrl.trim();
    const preset = PRESET_CALENDARS.find((item) => item.url === trimmedUrl);
    const calendarName = preset?.label ?? "Default";

    addCalendar(calendarName, [trimmedUrl]);
    clearError();
    setError("");
    await refreshSchedule();
    setOnboardingMode("groups");
    setOnboardingStep("theme");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCustomUrlSave = async () => {
    const validationError = validateUrl(inputUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    await applyCalendarUrl(inputUrl);
  };

  const renderStepNode = (step: number, icon: ReactNode, label: string) => {
    const isActive = step - 1 === activeStepIndex;
    const isComplete = step - 1 < activeStepIndex;
    const canNavigate = step === 1 || hasCalendar;

    return (
      <button
        type="button"
        onClick={() => {
          if (canNavigate) {
            setOnboardingStep(step === 1 ? "calendar" : "theme");
            setOnboardingMode("groups");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="flex items-center gap-2"
        disabled={!canNavigate}
        aria-label={label}
      >
        <div
          className="h-9 w-9 rounded-full border flex items-center justify-center"
          style={{
            borderColor:
              isActive || isComplete
                ? "var(--color-accent)"
                : "var(--color-border-alpha-30)",
            backgroundColor: isComplete
              ? "var(--color-accent)"
              : isActive
                ? "var(--color-accent-alpha-20)"
                : "var(--color-surface)",
            color: isComplete ? "white" : "var(--color-accent)",
          }}
        >
          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : icon}
        </div>
        <span
          className="text-sm font-medium"
          style={{
            color:
              isActive || isComplete
                ? "var(--color-text)"
                : "var(--color-text-secondary)",
          }}
        >
          {label}
        </span>
      </button>
    );
  };

  const renderGroupList = (cohort: string, icon: ReactNode) => {
    const presets = PRESET_CALENDAR_GROUPS[cohort] ?? [];
    if (!presets.length) {
      return null;
    }

    return (
      <div
        className="rounded-lg p-3"
        style={{ backgroundColor: "var(--color-surface-secondary-alpha-20)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "var(--color-accent-alpha-20)",
              color: "var(--color-accent)",
            }}
          >
            {icon}
          </div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {cohort}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              onClick={() => applyCalendarUrl(preset.url)}
              className="justify-start"
              style={{
                backgroundColor: "var(--color-surface-secondary)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles
              className="h-5 w-5"
              style={{ color: "var(--color-accent)" }}
            />
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {t("onboarding.title")}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 md:max-w-xl md:mx-auto md:justify-center">
            {renderStepNode(
              1,
              <Calendar className="h-4 w-4" />,
              t("onboarding.steps.calendar"),
            )}
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "var(--color-border-alpha-30)" }}
            />
            {renderStepNode(
              2,
              <Palette className="h-4 w-4" />,
              t("onboarding.steps.theme"),
            )}
          </div>
        </header>

        {currentStep === 1 ? (
          !showCustomUrl ? (
            <section
              className="rounded-xl border p-4 md:p-5 space-y-4"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border-alpha-30)",
              }}
            >
              <div className="flex items-center gap-2">
                <Users
                  className="h-4 w-4"
                  style={{ color: "var(--color-accent)" }}
                />
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {t("onboarding.calendarStep.selectTitle")}
                </h2>
              </div>

              <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("onboarding.calendarStep.subtitle")}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {renderGroupList("PTIVIS25", <Users className="h-4 w-4" />)}
                {renderGroupList("PTIVIS26", <Users className="h-4 w-4" />)}
              </div>

              <div className="pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOnboardingMode("custom");
                  }}
                  className="gap-2 px-0 h-auto py-0 text-left whitespace-normal items-start max-w-full"
                  style={{ color: "var(--color-accent)" }}
                >
                  <LinkIcon className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="break-words">
                    {t("onboarding.calendarStep.customNotFound")}
                  </span>
                </Button>
              </div>
            </section>
          ) : (
            <section
              className="rounded-xl border p-4 md:p-5 space-y-4"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border-alpha-30)",
              }}
            >
              <div className="flex items-center gap-2">
                <LinkIcon
                  className="h-4 w-4"
                  style={{ color: "var(--color-accent)" }}
                />
                <h2
                  className="text-base font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {t("onboarding.calendarStep.custom.title")}
                </h2>
              </div>

              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: "var(--color-surface-secondary-alpha-20)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks
                    className="h-4 w-4"
                    style={{ color: "var(--color-accent)" }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text)" }}
                  >
                    {t("onboarding.calendarStep.guide.title")}
                  </p>
                </div>
                <ol
                  className="text-sm list-decimal list-inside space-y-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <li>{t("onboarding.calendarStep.guide.step1")}</li>
                  <li>{t("onboarding.calendarStep.guide.step2")}</li>
                  <li>{t("onboarding.calendarStep.guide.step3")}</li>
                  <li>{t("onboarding.calendarStep.guide.step4")}</li>
                </ol>
              </div>

              <Input
                id="onboarding-calendar-url"
                value={inputUrl}
                onChange={(event) => {
                  setInputUrl(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder={t("onboarding.calendarStep.custom.placeholder")}
                style={{
                  backgroundColor: "var(--color-surface-secondary)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleCustomUrlSave();
                  }
                }}
              />

              {error && (
                <p className="text-sm" style={{ color: "var(--color-error)" }}>
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOnboardingMode("groups");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("onboarding.calendarStep.custom.back")}
                </Button>
                <Button
                  type="button"
                  onClick={handleCustomUrlSave}
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {t("onboarding.calendarStep.custom.save")}
                </Button>
              </div>
            </section>
          )
        ) : (
          <section
            className="rounded-xl border p-4 md:p-5 space-y-4"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border-alpha-30)",
            }}
          >
            <div className="flex items-center gap-2">
              <Palette
                className="h-4 w-4"
                style={{ color: "var(--color-accent)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {t("onboarding.themeStep.title")}
              </h2>
            </div>

            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("onboarding.themeStep.subtitle")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {listedThemes.map((theme) => {
                const isSelected = config.theme === theme.id;
                const themeName = theme.nameKey
                  ? tSettings(theme.nameKey)
                  : theme.name || theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setConfig({ theme: theme.id })}
                    className="w-full rounded-lg border p-3 text-left flex items-center justify-between"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-accent-alpha-20)"
                        : "var(--color-surface-secondary-alpha-20)",
                      borderColor: isSelected
                        ? "var(--color-accent)"
                        : "var(--color-border-alpha-30)",
                      color: "var(--color-text)",
                    }}
                  >
                    <span className="font-medium">{themeName}</span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{
                          backgroundColor: theme.colors.accent,
                          borderColor: theme.colors.accentSecondary,
                        }}
                      />
                      {isSelected && (
                        <CheckCircle2
                          className="h-4 w-4"
                          style={{ color: "var(--color-accent)" }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOnboardingStep("calendar");
                  setOnboardingMode("groups");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("onboarding.themeStep.actions.back")}
              </Button>
              <Button type="button" variant="outline" onClick={onComplete}>
                {t("onboarding.themeStep.actions.skip")}
              </Button>
              <Button
                type="button"
                onClick={onComplete}
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                  border: "none",
                }}
              >
                {t("onboarding.themeStep.actions.done")}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
