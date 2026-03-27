import { AlertCircle, Calendar, Link } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PRESET_CALENDARS } from "@/lib/preset-calendars";
import { useCalendarStore, useScheduleStore } from "@/state/state-management";

interface CalendarUrlModalProps {
  children: React.ReactNode;
}

const QUICK_SETUP_CALENDARS = PRESET_CALENDARS.map((preset) => ({
  id: preset.id,
  url: preset.url,
  fallbackLabel: preset.label,
}));

export function CalendarUrlModal({ children }: CalendarUrlModalProps) {
  const { t } = useTranslation("schedule");
  const { t: tCommon } = useTranslation("common");
  const { refreshSchedule, clearError } = useScheduleStore();
  const { addCalendar, getActiveCalendar } = useCalendarStore();
  const activeCalendar = getActiveCalendar();
  const [inputUrl, setInputUrl] = useState(activeCalendar?.icalUrls[0] || "");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedQuickSetupId = useMemo(() => {
    const trimmedInput = inputUrl.trim();
    return QUICK_SETUP_CALENDARS.find(({ url }) => url === trimmedInput)?.id;
  }, [inputUrl]);

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      return t("calendarModal.validation.required");
    }

    try {
      new URL(url);
    } catch {
      return t("calendarModal.validation.invalid");
    }

    // Validate that it looks like a Turku AMK iCal URL
    if (!url.toLowerCase().includes("turkuamk.fi")) {
      return t("calendarModal.validation.mustBeTurkuAmk");
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateUrl(inputUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create a new "Default" calendar with the provided URL
    addCalendar("Default", [inputUrl.trim()]);
    setError("");
    setIsOpen(false);

    // Clear any existing errors and refresh the schedule
    clearError();
    await refreshSchedule();
  };

  const handleQuickSetup = async (calendarUrl: string) => {
    const trimmedUrl = calendarUrl.trim();

    // Create a new "Default" calendar with the quick setup URL
    addCalendar("Default", [trimmedUrl]);
    setInputUrl(trimmedUrl);
    setError("");
    setIsOpen(false);

    // Clear any existing errors and refresh the schedule
    clearError();
    await refreshSchedule();
  };

  const handleCancel = () => {
    setInputUrl(activeCalendar?.icalUrls[0] || "");
    setError("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
    setIsOpen(open);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle
              className="flex items-center gap-2"
              style={{
                color: "var(--color-text)",
              }}
            >
              <Calendar
                className="h-5 w-5"
                style={{ color: "var(--color-accent)" }}
              />
              {t("calendarModal.title")}
            </DialogTitle>
            <DialogDescription
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              {t("calendarModal.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Setup Options */}
            <div className="rounded-md">
              <div className="mb-3">
                <h4
                  className="font-medium mb-1"
                  style={{
                    color: "var(--color-text)",
                  }}
                >
                  {t("calendarModal.quickSetup.title")}
                </h4>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t("calendarModal.quickSetup.description")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {QUICK_SETUP_CALENDARS.map((calendar) => {
                  const translatedLabel = t(
                    `calendarModal.quickSetup.groups.${calendar.id}`,
                    {
                      defaultValue: calendar.fallbackLabel,
                    },
                  );
                  const isSelected = calendar.id === selectedQuickSetupId;
                  return (
                    <Button
                      key={calendar.id}
                      type="button"
                      variant="outline"
                      onClick={() => handleQuickSetup(calendar.url)}
                      aria-pressed={isSelected}
                      style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: isSelected
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                      className="justify-center"
                    >
                      {translatedLabel}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr
                style={{
                  flexGrow: 1,
                  borderColor: "var(--color-border-alpha-30)",
                }}
              />
              <span
                className="text-sm"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                {tCommon("actions.or")}
              </span>
              <hr
                style={{
                  flexGrow: 1,
                  borderColor: "var(--color-border-alpha-30)",
                }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="calendar-url"
                className="text-sm font-medium"
                style={{
                  color: "var(--color-text)",
                }}
              >
                {t("calendarModal.customUrl.label")}
              </label>
              <div className="relative">
                <Link
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--color-text-secondary)" }}
                />
                <Input
                  id="calendar-url"
                  placeholder={t("calendarModal.customUrl.placeholder")}
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (error) setError(""); // Clear error when user types
                  }}
                  className="pl-9"
                  style={{
                    backgroundColor: "var(--color-surface-secondary)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSave();
                    }
                  }}
                />
              </div>
              {error && (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{
                    color: "var(--color-error)",
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="p-3 rounded-md text-sm">
              <p
                className="font-medium mb-1"
                style={{
                  color: "var(--color-text)",
                }}
              >
                Oma ryhmä/kalenteri?
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                1. Kirjaudu Turku AMK:n lukkarikoneeseen
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                2. Lukujärjestysten hallinta &gt; Luo uusi lukujärjestys
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                3. Konfiguroi kalenteriin haluamasi tunnit / ryhmät
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                4. Napauta kalenteria &gt; Luo iCal-linkki &gt; Kopioi
                iCal-linkki leikepöydälle
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "transparent",
              }}
            >
              {t("calendarModal.actions.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
                border: "none",
              }}
            >
              {t("calendarModal.actions.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
