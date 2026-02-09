import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RealizationApiService } from "../services/realizationApi";
import { useScheduleStore } from "../state/schedule-store";
import type { ScheduleEvent } from "../types/schedule";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RealizationData {
  name: string;
  code: string;
  teaching_language: string;
  scope_amount: string;
  evaluation_scale: string;
  gname: string;
  office: string;
  start_date: string;
  end_date: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  teacher: string;
  tgroup: string;
  learning_material: string;
  further_information: string;
  events: Array<{
    event_id: number;
    start_date: string;
    end_date: string;
    subject: string;
    location?: Array<{
      class: string;
      name: string;
      parent: string;
    }>;
    reserved_for: string[];
    student_groups: string[];
  }>;
}

interface RealizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  realizationData: RealizationData | null;
  isLoading: boolean;
  error: string | null;
}

/** Small metadata badge used in the header area */
const MetaBadge = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    style={{
      backgroundColor: "var(--color-surface-alpha-40)",
      color: "var(--color-text-secondary)",
      border: "1px solid var(--color-border-alpha-30)",
    }}
  >
    <Icon className="h-3 w-3 shrink-0" />
    <span className="opacity-70">{label}:</span> {value}
  </span>
);

/** Inline label → value row used inside info sections */
const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex justify-between gap-4 py-1.5">
    <span
      className="text-sm font-medium shrink-0"
      style={{ color: "var(--color-text-secondary)" }}
    >
      {label}
    </span>
    <span
      className="text-sm text-right min-w-0 break-words"
      style={{ color: "var(--color-text)" }}
    >
      {children}
    </span>
  </div>
);

interface CalendarEventDisplay {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  reservedFor?: string[];
}

interface EventAnalysis {
  event: CalendarEventDisplay;
  isCompleted: boolean;
  overlappingEvents: ScheduleEvent[];
}

const RealizationDialog = ({
  open,
  onOpenChange,
  realizationData,
  isLoading,
  error,
}: RealizationDialogProps) => {
  const { t, i18n } = useTranslation("dialogs");
  const [lastRealization, setLastRealization] =
    useState<RealizationData | null>(null);
  const calendarEvents = useScheduleStore((s) => s.events);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fi-FI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("fi-FI", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRange = (start: Date, end: Date) => {
    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return `${start.toLocaleTimeString("fi-FI", timeOpts)} – ${end.toLocaleTimeString("fi-FI", timeOpts)}`;
  };

  useEffect(() => {
    if (realizationData) {
      setLastRealization(realizationData);
    }
  }, [realizationData]);

  const displayRealization = open
    ? realizationData
    : (realizationData ?? lastRealization);

  const headerTitle = displayRealization?.name || "";
  const isFinnish = i18n.language?.toLowerCase().startsWith("fi");

  // Analyze events: classify as completed/upcoming and detect overlaps
  const analyzedEvents = useMemo<EventAnalysis[]>(() => {
    if (!displayRealization?.code) return [];

    const now = new Date();
    const realizationCode = displayRealization.code?.toLowerCase() ?? "";

    const realizationCalendarEvents = calendarEvents.filter((ce) => {
      const ceCode = RealizationApiService.extractRealizationCode(ce.title);
      return ceCode?.toLowerCase() === realizationCode;
    });

    // Pre-filter calendar events: exclude events from the same realization
    const otherCalendarEvents = calendarEvents.filter((ce) => {
      const ceCode = RealizationApiService.extractRealizationCode(ce.title);
      return ceCode?.toLowerCase() !== realizationCode;
    });

    // Sort realization events chronologically
    const sorted = [...realizationCalendarEvents].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    return sorted.map((event) => {
      const isCompleted = event.endTime < now;

      // Find overlapping calendar events
      const overlappingEvents = otherCalendarEvents.filter((ce) => {
        const ceStart = new Date(ce.startTime);
        const ceEnd = new Date(ce.endTime);
        return event.startTime < ceEnd && event.endTime > ceStart;
      });

      return {
        event: {
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
        },
        isCompleted,
        overlappingEvents,
      };
    });
  }, [displayRealization, calendarEvents]);

  const upcomingCount = analyzedEvents.filter((e) => !e.isCompleted).length;
  const completedCount = analyzedEvents.filter((e) => e.isCompleted).length;
  const overlappingCount = analyzedEvents.filter(
    (e) => e.overlappingEvents.length > 0,
  ).length;
  const overlappingPercent =
    analyzedEvents.length > 0
      ? Math.round((overlappingCount / analyzedEvents.length) * 100)
      : 0;

  const getEventHours = (e: EventAnalysis) => {
    return Math.max(
      0,
      (e.event.endTime.getTime() - e.event.startTime.getTime()) / 3_600_000,
    );
  };
  const upcomingHours = analyzedEvents
    .filter((e) => !e.isCompleted)
    .reduce((sum, e) => sum + getEventHours(e), 0);
  const completedHours = analyzedEvents
    .filter((e) => e.isCompleted)
    .reduce((sum, e) => sum + getEventHours(e), 0);
  const overlappingHours = analyzedEvents
    .filter((e) => e.overlappingEvents.length > 0)
    .reduce((sum, e) => sum + getEventHours(e), 0);

  const fmtHours = (h: number) => (h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`);

  const metaBadges = displayRealization
    ? ([
        displayRealization.scope_amount
          ? {
              icon: BookOpen,
              label: t("realizationDialog.basicInfo.credits"),
              value: `${displayRealization.scope_amount} op`,
            }
          : null,
        displayRealization.office
          ? {
              icon: MapPin,
              label: t("realizationDialog.basicInfo.campus"),
              value: displayRealization.office,
            }
          : null,
        displayRealization.teaching_language
          ? {
              icon: GraduationCap,
              label: t("realizationDialog.basicInfo.teachingLanguage"),
              value: displayRealization.teaching_language,
            }
          : null,
        displayRealization.evaluation_scale
          ? {
              icon: Info,
              label: t("realizationDialog.basicInfo.evaluationScale"),
              value: displayRealization.evaluation_scale,
            }
          : null,
      ].filter(Boolean) as Array<{
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        value: string;
      }>)
    : [];

  const teachers =
    displayRealization?.teacher
      ?.split(";")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

  const groups =
    displayRealization?.tgroup
      ?.split(";")
      .map((g) => g.trim())
      .filter(Boolean) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          {headerTitle && (
            <DialogTitle
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--color-text)" }}
            >
              <GraduationCap className="h-6 w-6 shrink-0" />
              {headerTitle}
            </DialogTitle>
          )}
          {metaBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {metaBadges.map((badge) => (
                <MetaBadge
                  key={badge.label}
                  icon={badge.icon}
                  label={badge.label}
                  value={badge.value}
                />
              ))}
            </div>
          )}
        </DialogHeader>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center justify-center py-8"
              style={{ color: "var(--color-text)", willChange: "opacity" }}
            >
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: "var(--color-accent)" }}
              />
              <span className="ml-3">{t("realizationDialog.loading")}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--color-error-alpha-20)",
                borderColor: "var(--color-error-alpha-40)",
                willChange: "opacity",
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{ color: "var(--color-error)" }}
              >
                <Info className="h-5 w-5" />
                <span className="font-medium">
                  {t("realizationDialog.error.title")}
                </span>
              </div>
              <p className="mt-2" style={{ color: "var(--color-error)" }}>
                {error}
              </p>
            </motion.div>
          )}

          {displayRealization && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
              style={{ willChange: "transform, opacity" }}
            >
              {/* Dates — schedule + enrollment combined */}
              <div
                className="rounded-lg border overflow-hidden"
                style={{
                  backgroundColor: "var(--color-surface-alpha-40)",
                  borderColor: "var(--color-border-alpha-30)",
                }}
              >
                <div className="flex flex-col">
                  {/* Implementation period */}
                  <div
                    className="p-4 border-b"
                    style={{ borderColor: "var(--color-border-alpha-30)" }}
                  >
                    <h4
                      className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Calendar className="h-4 w-4" />
                      {t("realizationDialog.schedule.title")}
                    </h4>
                    <div>
                      <InfoRow label={t("realizationDialog.schedule.starts")}>
                        {formatDate(displayRealization.start_date)}
                      </InfoRow>
                      <InfoRow label={t("realizationDialog.schedule.ends")}>
                        {formatDate(displayRealization.end_date)}
                      </InfoRow>
                    </div>
                  </div>

                  {/* Enrollment */}
                  <div className="p-4">
                    <h4
                      className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Clock className="h-4 w-4" />
                      {t("realizationDialog.enrollment.title")}
                    </h4>
                    <div>
                      <InfoRow label={t("realizationDialog.enrollment.starts")}>
                        {formatDate(displayRealization.enrollment_start_date)}
                      </InfoRow>
                      <InfoRow label={t("realizationDialog.enrollment.ends")}>
                        {formatDate(displayRealization.enrollment_end_date)}
                      </InfoRow>
                    </div>
                  </div>
                </div>
              </div>

              {/* People & teachers */}
              {(teachers.length > 0 || groups.length > 0) && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-surface-alpha-40)",
                    borderColor: "var(--color-border-alpha-30)",
                  }}
                >
                  <div className="grid grid-cols-1">
                    {teachers.length > 0 && (
                      <div
                        className="p-4"
                        style={{
                          borderBottom:
                            teachers.length > 0 && groups.length > 0
                              ? "1px solid var(--color-border-alpha-30)"
                              : undefined,
                        }}
                      >
                        <h4
                          className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <GraduationCap className="h-4 w-4" />
                          {t("realizationDialog.instructor.title")}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {teachers.map((teacher) => (
                            <span
                              key={teacher}
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text)",
                                border:
                                  "1px solid var(--color-border-alpha-30)",
                              }}
                            >
                              {teacher}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {groups.length > 0 && (
                      <div className="p-4">
                        <h4
                          className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Users className="h-4 w-4" />
                          {t("realizationDialog.groups.title")}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {groups.map((group) => (
                            <span
                              key={group}
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: "var(--color-surface)",
                                color: "var(--color-text)",
                                border:
                                  "1px solid var(--color-border-alpha-30)",
                              }}
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Learning Materials & Further Information */}
              {(displayRealization.learning_material ||
                displayRealization.further_information) && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-surface-alpha-40)",
                    borderColor: "var(--color-border-alpha-30)",
                  }}
                >
                  <div className="grid grid-cols-1">
                    {displayRealization.learning_material && (
                      <div
                        className={`p-4 ${displayRealization.further_information ? "border-b" : ""}`}
                        style={
                          displayRealization.further_information
                            ? { borderColor: "var(--color-border-alpha-30)" }
                            : undefined
                        }
                      >
                        <h4
                          className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <BookOpen className="h-4 w-4" />
                          {t("realizationDialog.learningMaterial.title")}
                        </h4>
                        <p
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                          style={{ color: "var(--color-text)" }}
                        >
                          {displayRealization.learning_material}
                        </p>
                      </div>
                    )}

                    {displayRealization.further_information && (
                      <div className="p-4">
                        <h4
                          className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Info className="h-4 w-4" />
                          {t("realizationDialog.furtherInformation.title")}
                        </h4>
                        <p
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                          style={{ color: "var(--color-text)" }}
                        >
                          {displayRealization.further_information}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Events */}
              {analyzedEvents.length > 0 && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-surface-alpha-40)",
                    borderColor: "var(--color-border-alpha-30)",
                  }}
                >
                  <div className="p-4">
                    <h4
                      className="text-sm font-semibold mb-3 flex items-center gap-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Calendar className="h-4 w-4" />
                      {t("realizationDialog.events.title")}
                      <span
                        className="ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-accent-text, #fff)",
                        }}
                      >
                        {analyzedEvents.length}
                      </span>
                    </h4>

                    {/* Stat cards */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--color-accent)",
                          color: "var(--color-accent-text, #fff)",
                        }}
                      >
                        <Calendar className="h-3 w-3 shrink-0" />
                        {t("realizationDialog.events.upcoming")}:{" "}
                        {upcomingCount}
                        <span className="opacity-75">
                          · {fmtHours(upcomingHours)}
                        </span>
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, #22c55e 18%, transparent)",
                          color: "#22c55e",
                          border:
                            "1px solid color-mix(in srgb, #22c55e 30%, transparent)",
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        {t("realizationDialog.events.completed")}:{" "}
                        {completedCount}
                        <span className="opacity-75">
                          · {fmtHours(completedHours)}
                        </span>
                      </span>
                      {overlappingCount > 0 && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, #f59e0b 18%, transparent)",
                            color: "#f59e0b",
                            border:
                              "1px solid color-mix(in srgb, #f59e0b 30%, transparent)",
                          }}
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {t("realizationDialog.events.overlapping")}:{" "}
                          {overlappingCount} ({overlappingPercent}%)
                          <span className="opacity-75">
                            · {fmtHours(overlappingHours)}
                          </span>
                        </span>
                      )}
                    </div>

                    <div
                      className="w-full rounded-md px-4 py-2.5 pr-1 text-xs leading-relaxed box-border mb-3"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, #3b82f6 8%, var(--color-surface))",
                        color: "var(--color-text-secondary)",
                        border:
                          "1px solid color-mix(in srgb, #3b82f6 20%, transparent)",
                      }}
                    >
                      <Info className="inline h-3 w-3 mr-1 -mt-px" />
                      {isFinnish
                        ? "Tämä lista saattaa olla puutteellinen. Avoin Lukkarikone yhdistää kalenteritapahtumia tähän toteutukseen nimessä sijaitsevan toteutuskoodin perusteella (esim. kh00cz65-302). Jos tämä koodi puuttuu tapahtuman nimestä, se ei näy tässä listassa. Viraallisen listan löydät viraallisesta lukkarikoneesta."
                        : "This may not be an exhaustive list! Open Lukkarikone associates events to this realization by the realization code in their name (e.g. kh00cz65-302). If this code is missing, the specific event won't show up in this list. You can view an exhaustive list in the official Lukkarikone."}
                    </div>

                    {/* Full event list */}
                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {analyzedEvents.map(
                        ({ event, isCompleted, overlappingEvents }) => (
                          <div
                            key={event.id}
                            className="flex items-start gap-2.5 text-sm px-3 py-2 rounded-md transition-opacity"
                            style={{
                              backgroundColor: "var(--color-surface)",
                              border: "1px solid var(--color-border-alpha-30)",
                              opacity: isCompleted ? 0.55 : 1,
                            }}
                          >
                            {/* Status dot */}
                            <span
                              className="mt-1 h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  overlappingEvents.length > 0
                                    ? "#f59e0b"
                                    : isCompleted
                                      ? "#22c55e"
                                      : "var(--color-accent)",
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              {/* Primary row: date + time range + location */}
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <span
                                  className="font-medium text-xs tabular-nums"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {formatDateTime(event.startTime)}
                                </span>
                                <span
                                  className="text-[11px] tabular-nums"
                                  style={{
                                    color: "var(--color-text-secondary)",
                                  }}
                                >
                                  {formatTimeRange(
                                    event.startTime,
                                    event.endTime,
                                  )}
                                </span>
                              </div>

                              {/* Location + reserved_for */}
                              <div
                                className="text-xs mt-0.5 min-w-0 break-words"
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                {event.location &&
                                  event.location.trim().length > 0 && (
                                    <span>
                                      <MapPin className="inline h-3 w-3 mr-0.5 -mt-px" />
                                      {event.location}
                                    </span>
                                  )}
                                {event.reservedFor &&
                                  event.reservedFor.length > 0 && (
                                    <span
                                      className={event.location ? "ml-2" : ""}
                                    >
                                      <GraduationCap className="inline h-3 w-3 mr-0.5 -mt-px" />
                                      {event.reservedFor.join(", ")}
                                    </span>
                                  )}
                              </div>

                              {/* Overlap warning */}
                              {overlappingEvents.length > 0 && (
                                <div
                                  className="flex items-center gap-1 text-[11px] mt-1"
                                  style={{ color: "#f59e0b" }}
                                >
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>
                                    {overlappingEvents
                                      .map((oe) =>
                                        t(
                                          "realizationDialog.events.overlapsWith",
                                          {
                                            event:
                                              RealizationApiService.stripRealizationCode(
                                                oe.title,
                                              ),
                                          },
                                        ),
                                      )
                                      .join("; ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RealizationDialog;
