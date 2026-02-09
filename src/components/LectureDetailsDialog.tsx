import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  MapPin,
  Palette,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RealizationApiService } from "../services/realizationApi";
import {
  useEventMetadataStore,
  useRealizationMetadataStore,
  useScheduleStore,
} from "../state/state-management";
import type { ScheduleEvent } from "../types/schedule";
import { ActionButton } from "./ui/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface LectureDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
  onOpenRealizationDialog?: (eventTitle: string) => void;
  onOpenColorCustomizer?: (event: ScheduleEvent) => void;
  isRealizationLoading?: boolean;
}

const LectureDetailsDialog = ({
  open,
  onOpenChange,
  event,
  onOpenRealizationDialog,
  onOpenColorCustomizer,
  isRealizationLoading = false,
}: LectureDetailsDialogProps) => {
  const { t } = useTranslation("dialogs");
  const { t: tColor } = useTranslation("colorCustomization");
  const {
    clearEventHidden,
    getEventMetadata,
    isEventHidden,
    metadataByEvent,
    setEventHidden,
  } = useEventMetadataStore();
  const { hideRealization, isRealizationHidden, showRealization } =
    useRealizationMetadataStore();
  const { events } = useScheduleStore();
  const [lastEvent, setLastEvent] = useState<ScheduleEvent | null>(null);
  const [hideCourseDialogOpen, setHideCourseDialogOpen] = useState(false);
  const noRealizationWhyNotLabel = t(
    "lectureDetailsDialog.noRealizationWhyNot",
  );
  const noRealizationWhyNotExplanation = t(
    "lectureDetailsDialog.noRealizationWhyNotExplanation",
  );

  useEffect(() => {
    if (event) {
      setLastEvent(event);
    }
  }, [event]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fi-FI", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDurationString = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);

    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  };

  const handleOpenRealizationDialog = () => {
    if (event && onOpenRealizationDialog) {
      onOpenRealizationDialog(event.title);
    }
  };

  const handleToggleVisibility = () => {
    if (!event) {
      return;
    }
    // Visibility priority: per-event override, then realization hidden state, then event default; setEventHidden flips the effective state.
    const realizationCode = RealizationApiService.extractRealizationCode(
      event.title,
    );
    const override = getEventMetadata(event.id)?.hidden;
    if (typeof override === "boolean") {
      setEventHidden(event.id, !override);
      return;
    }
    if (realizationCode && isRealizationHidden(realizationCode)) {
      setEventHidden(event.id, false);
      return;
    }
    setEventHidden(event.id, !isEventHidden(event.id));
  };

  const handleOpenColorCustomizer = () => {
    if (event && onOpenColorCustomizer) {
      onOpenColorCustomizer(event);
    }
  };

  const handleConfirmHideCourse = () => {
    if (!event) {
      return;
    }
    const realizationCode = RealizationApiService.extractRealizationCode(
      event.title,
    );
    if (!realizationCode) {
      return;
    }
    hideRealization(realizationCode);
    setHideCourseDialogOpen(false);
  };

  const handleShowCourse = () => {
    if (!event) {
      return;
    }
    const realizationCode = RealizationApiService.extractRealizationCode(
      event.title,
    );
    if (!realizationCode) {
      return;
    }
    showRealization(realizationCode);
    events.forEach((scheduledEvent) => {
      const scheduledCode = RealizationApiService.extractRealizationCode(
        scheduledEvent.title,
      );
      if (scheduledCode !== realizationCode) {
        return;
      }
      if (metadataByEvent[scheduledEvent.id]?.hidden === false) {
        clearEventHidden(scheduledEvent.id);
      }
    });
  };

  const getInterestingDescription = (description?: string | null) => {
    if (!description) return null;

    const stripped = description
      .replace(/\bHenkilö\(t\):[^\n\r]*/gi, "")
      .replace(/\bRyhmä\(t\):[^\n\r]*/gi, "");
    const cleaned = stripped
      .replace(/\s*\n\s*/g, "\n")
      .replace(/\s{2,}/g, " ")
      .replace(/^[,.;:\-\s]+|[,.;:\-\s]+$/g, "")
      .trim();

    return cleaned.length > 0 ? cleaned : null;
  };

  const displayEvent = event ?? lastEvent;
  const displayTitle = displayEvent
    ? (() => {
        const baseTitle = RealizationApiService.stripRealizationCode(
          displayEvent.title,
        );
        const realizationCode = RealizationApiService.extractRealizationCode(
          displayEvent.title,
        );
        if (!realizationCode) {
          return baseTitle;
        }
        const codeForDisplay = realizationCode.toUpperCase();
        return `${baseTitle} ${codeForDisplay}`.trim();
      })()
    : "";
  const displayDescription = displayEvent
    ? getInterestingDescription(displayEvent.description)
    : null;
  const headerTitle = displayEvent ? displayTitle : "";
  const headerDescription = displayEvent ? displayDescription : null;
  const realizationCode = event
    ? RealizationApiService.extractRealizationCode(event.title)
    : null;
  const hasRealizationCode = event
    ? RealizationApiService.hasRealizationCode(event.title)
    : false;
  const isHidden = event
    ? (() => {
        const override = getEventMetadata(event.id)?.hidden;
        if (typeof override === "boolean") {
          return override;
        }
        return Boolean(realizationCode && isRealizationHidden(realizationCode));
      })()
    : false;
  const isCourseHidden = realizationCode
    ? isRealizationHidden(realizationCode)
    : false;

  const teachers = (event?.teachers ?? [])
    .flatMap((teacher) => teacher.split(","))
    .map((teacher) => teacher.trim())
    .filter(Boolean);
  const groups = (event?.groups ?? [])
    .flatMap((group) => group.split(","))
    .map((group) => group.trim())
    .filter(Boolean);
  const hasTeachers = teachers.length > 0;
  const hasGroups = groups.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            {headerTitle && (
              <DialogTitle
                className="text-xl font-bold flex items-center gap-2"
                style={{ color: "var(--color-text)" }}
              >
                <BookOpen className="h-6 w-6 shrink-0" />
                {headerTitle}
              </DialogTitle>
            )}
            {headerDescription && (
              <DialogDescription
                style={{ color: "var(--color-text-secondary)" }}
              >
                {headerDescription}
              </DialogDescription>
            )}
          </DialogHeader>

          <AnimatePresence mode="wait">
            {event && (
              <motion.div
                key="lecture-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4"
                style={{ willChange: "transform, opacity" }}
              >
                {/* Date & Schedule */}
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: "var(--color-surface-alpha-40)",
                    borderColor: "var(--color-border-alpha-30)",
                  }}
                >
                  <div className="p-4">
                    <h4
                      className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Calendar className="h-4 w-4" />
                      {t("lectureDetailsDialog.schedule")}
                    </h4>
                    <div className="space-y-1">
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {formatDate(event.startTime)}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {formatTime(event.startTime)} –{" "}
                        {formatTime(event.endTime)}
                        <span
                          className="ml-2 text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          ({getDurationString(event.duration)})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{
                      backgroundColor: "var(--color-surface-alpha-40)",
                      borderColor: "var(--color-border-alpha-30)",
                    }}
                  >
                    <div className="p-4">
                      <h4
                        className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <MapPin className="h-4 w-4" />
                        {t("lectureDetailsDialog.location")}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* People & teachers */}
                {(hasTeachers || hasGroups) && (
                  <div
                    className="rounded-lg border overflow-hidden"
                    style={{
                      backgroundColor: "var(--color-surface-alpha-40)",
                      borderColor: "var(--color-border-alpha-30)",
                    }}
                  >
                    <div className="flex flex-col">
                      {hasTeachers && (
                        <div
                          className={`p-4 ${hasGroups ? "border-b" : ""}`}
                          style={
                            hasGroups
                              ? { borderColor: "var(--color-border-alpha-30)" }
                              : undefined
                          }
                        >
                          <h4
                            className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <GraduationCap className="h-4 w-4" />
                            {t("lectureDetailsDialog.teachers")}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {teachers.map((teacher, index) => (
                              <span
                                key={`${teacher}-${index}`}
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

                      {hasGroups && (
                        <div className="p-4">
                          <h4
                            className="text-sm font-semibold mb-2 flex items-center gap-1.5"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            <Users className="h-4 w-4" />
                            {t("lectureDetailsDialog.studentGroups")}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {groups.map((group, index) => (
                              <span
                                key={`${group}-${index}`}
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

                {/* Action Button for Realization Dialog */}
                {event && (
                  <div
                    className="pt-4 border-t"
                    style={{ borderColor: "var(--color-border-alpha-30)" }}
                  >
                    <div className="space-y-2">
                      {hasRealizationCode && onOpenRealizationDialog && (
                        <ActionButton
                          onClick={handleOpenRealizationDialog}
                          variant="primary"
                          disabled={isRealizationLoading}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isRealizationLoading ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                            {t("lectureDetailsDialog.showRealizationDetails")}
                          </div>
                        </ActionButton>
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
                        <ActionButton
                          onClick={handleToggleVisibility}
                          variant="subtle"
                          className="w-full sm:w-auto"
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isHidden ? (
                              <>
                                <Eye className="h-4 w-4" />
                                {tColor("contextMenu.showEvent")}
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4" />
                                {tColor("contextMenu.hideEvent")}
                              </>
                            )}
                          </div>
                        </ActionButton>
                        {onOpenColorCustomizer && (
                          <ActionButton
                            onClick={handleOpenColorCustomizer}
                            variant="subtle"
                            className="w-full sm:w-auto"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Palette className="h-4 w-4" />
                              {tColor("contextMenu.customizeColor")}
                            </div>
                          </ActionButton>
                        )}
                        {hasRealizationCode && (
                          <ActionButton
                            onClick={() => {
                              if (isCourseHidden) {
                                handleShowCourse();
                              } else {
                                setHideCourseDialogOpen(true);
                              }
                            }}
                            variant={isCourseHidden ? "subtle" : "danger"}
                            className="w-full sm:w-auto"
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isCourseHidden
                                ? t("lectureDetailsDialog.showCourse")
                                : t("lectureDetailsDialog.hideCourse")}
                            </div>
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info about missing realization data */}
                {event.title && !hasRealizationCode && (
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: "var(--color-surface-alpha-40)",
                      borderColor: "var(--color-border-alpha-30)",
                    }}
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Info className="h-4 w-4 shrink-0" />
                      <span className="text-sm">
                        {t("lectureDetailsDialog.noRealizationData")}{" "}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="hidden md:inline-flex underline underline-offset-2"
                              >
                                {noRealizationWhyNotLabel}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs text-xs"
                            >
                              {noRealizationWhyNotExplanation}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Sheet>
                          <SheetTrigger asChild>
                            <button
                              type="button"
                              className="md:hidden underline underline-offset-2"
                            >
                              {noRealizationWhyNotLabel}
                            </button>
                          </SheetTrigger>
                          <SheetContent side="bottom">
                            <SheetHeader>
                              <SheetTitle>
                                {noRealizationWhyNotLabel}
                              </SheetTitle>
                              <SheetDescription>
                                {noRealizationWhyNotExplanation}
                              </SheetDescription>
                            </SheetHeader>
                          </SheetContent>
                        </Sheet>
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <Dialog
        open={hideCourseDialogOpen}
        onOpenChange={setHideCourseDialogOpen}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {t("lectureDetailsDialog.hideCourseDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-3">
              <p>{t("lectureDetailsDialog.hideCourseDialog.line1")}</p>
              <p>{t("lectureDetailsDialog.hideCourseDialog.line2")}</p>
              <p>{t("lectureDetailsDialog.hideCourseDialog.line3")}</p>
            </div>
          </DialogDescription>
          <DialogFooter>
            <ActionButton
              onClick={() => setHideCourseDialogOpen(false)}
              variant="subtle"
              className="w-full sm:w-auto"
            >
              {t("lectureDetailsDialog.hideCourseDialog.cancel")}
            </ActionButton>
            <ActionButton
              onClick={handleConfirmHideCourse}
              variant="danger"
              className="w-full sm:w-auto"
            >
              {t("lectureDetailsDialog.hideCourseDialog.confirm")}
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LectureDetailsDialog;
