import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isPresetCalendarUrl } from "@/lib/preset-calendars";
import { useCalendarStore } from "@/state/state-management";

export function Ptivis25Notice() {
  const { t } = useTranslation("schedule");
  const activeCalendar = useCalendarStore((state) =>
    state.calendars.find((calendar) => calendar.id === state.activeCalendarId),
  );
  const isPtivis25Calendar =
    activeCalendar?.icalUrls.some((url) =>
      isPresetCalendarUrl(url, "PTIVIS25"),
    ) ?? false;

  if (!isPtivis25Calendar) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-4">
      <div
        role="alert"
        className="flex gap-3 rounded-xl border p-4"
        style={{
          backgroundColor:
            "var(--color-warning-alpha-20, rgba(245, 158, 11, 0.14))",
          borderColor: "var(--color-warning, rgb(245, 158, 11))",
          color: "var(--color-text)",
        }}
      >
        <TriangleAlert
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: "var(--color-warning)" }}
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-semibold">{t("ptivis25Notice.title")}</p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("ptivis25Notice.description")}
          </p>
        </div>
      </div>
    </div>
  );
}
