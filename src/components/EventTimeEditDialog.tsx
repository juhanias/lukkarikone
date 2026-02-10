import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEventMetadataStore, useScheduleStore } from "../state/state-management";
import type { ScheduleEvent } from "../types/schedule";
import { ScheduleUtils } from "../utils/schedule-utils";
import { ActionButton } from "./ui/ActionButton";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface EventTimeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
}

const padTime = (value: number) => value.toString().padStart(2, "0");

const formatTimeValue = (date: Date) =>
  `${padTime(date.getHours())}:${padTime(date.getMinutes())}`;

const mergeDateAndTime = (date: Date, timeValue: string) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
};

const EventTimeEditDialog = ({
  open,
  onOpenChange,
  event,
}: EventTimeEditDialogProps) => {
  const { t } = useTranslation("dialogs");
  const { getEventTimeOverride, setEventTimeOverride } =
    useEventMetadataStore();
  const { applyEventTimeOverride } = useScheduleStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [startTimeValue, setStartTimeValue] = useState("");
  const [endTimeValue, setEndTimeValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const startDigitsRef = useRef(0);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const activeOverride = useMemo(() => {
    if (!event) {
      return null;
    }
    return getEventTimeOverride(event.id);
  }, [event, getEventTimeOverride]);

  useEffect(() => {
    if (!open || !event) {
      return;
    }
    const baseStart = activeOverride
      ? new Date(activeOverride.startTimeIso)
      : event.startTime;
    const baseEnd = activeOverride
      ? new Date(activeOverride.endTimeIso)
      : event.endTime;
    setSelectedDate(baseStart);
    setStartTimeValue(formatTimeValue(baseStart));
    setEndTimeValue(formatTimeValue(baseEnd));
    setError(null);
    startDigitsRef.current = 0;
  }, [activeOverride, event, open]);

  const durationLabel = useMemo(() => {
    if (!selectedDate || !startTimeValue || !endTimeValue) {
      return null;
    }
    const start = mergeDateAndTime(selectedDate, startTimeValue);
    const end = mergeDateAndTime(selectedDate, endTimeValue);
    const durationMs = end.getTime() - start.getTime();
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      return null;
    }
    const totalMinutes = Math.round(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${minutes}m`;
  }, [selectedDate, startTimeValue, endTimeValue]);

  const handleSave = () => {
    if (!event || !selectedDate) {
      setError(t("eventTimeEditDialog.errors.missingDate"));
      return;
    }
    const nextStart = mergeDateAndTime(selectedDate, startTimeValue);
    const nextEnd = mergeDateAndTime(selectedDate, endTimeValue);
    if (nextEnd <= nextStart) {
      setError(t("eventTimeEditDialog.errors.invalidRange"));
      return;
    }

    const defaultStart = activeOverride
      ? new Date(activeOverride.originalStartTimeIso)
      : event.startTime;
    const defaultEnd = activeOverride
      ? new Date(activeOverride.originalEndTimeIso)
      : event.endTime;
    const defaultHash =
      activeOverride?.defaultHash ??
      ScheduleUtils.getEventDefaultHash(
        event.title,
        event.startTime,
        event.endTime,
      );

    const override = {
      startTimeIso: nextStart.toISOString(),
      endTimeIso: nextEnd.toISOString(),
      originalStartTimeIso: defaultStart.toISOString(),
      originalEndTimeIso: defaultEnd.toISOString(),
      defaultHash,
      updatedAt: new Date().toISOString(),
    };

    setEventTimeOverride(event.id, override);
    applyEventTimeOverride(event.id, override);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("eventTimeEditDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("eventTimeEditDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("eventTimeEditDialog.dateLabel")}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>
                    {selectedDate
                      ? format(selectedDate, "PPP")
                      : t("eventTimeEditDialog.pickDate")}
                  </span>
                  <CalendarIcon className="h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="event-time-start"
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("eventTimeEditDialog.startTimeLabel")}
              </label>
              <Input
                id="event-time-start"
                type="time"
                value={startTimeValue}
                onKeyDown={(eventInput) => {
                  if (/^\d$/.test(eventInput.key)) {
                    startDigitsRef.current += 1;
                  } else if (eventInput.key === "Backspace") {
                    startDigitsRef.current = Math.max(
                      0,
                      startDigitsRef.current - 1,
                    );
                  }
                }}
                onChange={(eventInput) => {
                  const nextValue = eventInput.target.value;
                  setStartTimeValue(nextValue);
                  if (
                    startDigitsRef.current >= 4 &&
                    /^\d{2}:\d{2}$/.test(nextValue)
                  ) {
                    endTimeRef.current?.focus();
                    endTimeRef.current?.select();
                    startDigitsRef.current = 0;
                  }
                }}
                className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="event-time-end"
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("eventTimeEditDialog.endTimeLabel")}
                {durationLabel ? ` (${durationLabel})` : ""}
              </label>
              <Input
                id="event-time-end"
                type="time"
                ref={endTimeRef}
                value={endTimeValue}
                onChange={(eventInput) => setEndTimeValue(eventInput.target.value)}
                className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <ActionButton
            onClick={() => onOpenChange(false)}
            variant="subtle"
            className="w-full sm:w-auto"
          >
            {t("eventTimeEditDialog.cancel")}
          </ActionButton>
          <ActionButton
            onClick={handleSave}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {t("eventTimeEditDialog.save")}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventTimeEditDialog;
