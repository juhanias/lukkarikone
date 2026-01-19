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
import useConfigStore, {
  useCalendarStore,
  useScheduleStore,
} from "@/state/state-management";

interface CalendarUrlModalProps {
  children: React.ReactNode;
}

const QUICK_SETUP_CALENDARS = [
  {
    id: "ptivis25a",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=9385A6CBC6B79C3DDCE6B2738B5C1B882A6D64CA",
    fallbackLabel: "PTIVIS25A",
  },
  {
    id: "ptivis25b",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8",
    fallbackLabel: "PTIVIS25B",
  },
  {
    id: "ptivis25c",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=E4AC87D135AF921A83B677DD15A19E6119DDF0BB",
    fallbackLabel: "PTIVIS25C",
  },
  {
    id: "ptivis25d",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=E8F13D455EA82E8A7D0990CF6983BBE61AD839A7",
    fallbackLabel: "PTIVIS25D",
  },
  {
    id: "ptivis25e",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=346C225AD26BD6966FC656F8E77B5A3EA38A73B5",
    fallbackLabel: "PTIVIS25E",
  },
  {
    id: "ptivis25f",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=6EAF3A6D4FC2B07836C2B742EC923629839CA0B7",
    fallbackLabel: "PTIVIS25F",
  },
] as const;

export function CalendarUrlModal({ children }: CalendarUrlModalProps) {
  const { t } = useTranslation("schedule");
  const { t: tCommon } = useTranslation("common");
  const { config } = useConfigStore();
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
    <div style={{ fontFamily: `var(--font-${config.font})` }}>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto"
          style={{
            fontFamily: `var(--font-${config.font})`,
          }}
        >
          <DialogHeader className="text-left">
            <DialogTitle
              className="flex items-center gap-2"
              style={{
                color: "var(--color-text)",
                fontFamily: `var(--font-${config.font})`,
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
                fontFamily: `var(--font-${config.font})`,
              }}
            >
              {t("calendarModal.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick Setup Options */}
            <div
              className="rounded-md"
              style={{
                fontFamily: `var(--font-${config.font})`,
              }}
            >
              <div className="mb-3">
                <h4
                  className="font-medium mb-1"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: `var(--font-${config.font})`,
                  }}
                >
                  {t("calendarModal.quickSetup.title")}
                </h4>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: `var(--font-${config.font})`,
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
                        fontFamily: `var(--font-${config.font})`,
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
                  fontFamily: `var(--font-${config.font})`,
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
                  fontFamily: `var(--font-${config.font})`,
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
                    fontFamily: `var(--font-${config.font})`,
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
                    fontFamily: `var(--font-${config.font})`,
                  }}
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            <div
              className="p-3 rounded-md text-sm"
              style={{
                fontFamily: `var(--font-${config.font})`,
              }}
            >
              <p
                className="font-medium mb-1"
                style={{
                  color: "var(--color-text)",
                  fontFamily: `var(--font-${config.font})`,
                }}
              >
                Oma ryhmä/kalenteri?
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: `var(--font-${config.font})`,
                }}
              >
                1. Kirjaudu Turku AMK:n lukkarikoneeseen
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: `var(--font-${config.font})`,
                }}
              >
                2. Lukujärjestysten hallinta &gt; Luo uusi lukujärjestys
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: `var(--font-${config.font})`,
                }}
              >
                3. Konfiguroi kalenteriin haluamasi tunnit / ryhmät
              </p>
              <p
                className="mb-2"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: `var(--font-${config.font})`,
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
                fontFamily: `var(--font-${config.font})`,
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
                fontFamily: `var(--font-${config.font})`,
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
