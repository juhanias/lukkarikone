import { format } from "date-fns";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "../hooks/useIsMobile";
import { useScheduleStore } from "../state/state-management";
import { RealizationColorUtils } from "../utils/realization-color-utils";
import { ScheduleUtils } from "../utils/schedule-utils";
import { ActionButton } from "./ui/ActionButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
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
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: Date;
}

const mergeDateAndTime = (date: Date, timeValue: string) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
};

const isValidTimeValue = (value: string) => /^\d{2}:\d{2}$/.test(value);
const PRESET_COLORS = ScheduleUtils.getPresetEventColors();

const CreateEventDialog = ({
  open,
  onOpenChange,
  initialDate,
}: CreateEventDialogProps) => {
  const { t } = useTranslation("dialogs");
  const { t: tColor } = useTranslation("colorCustomization");
  const isMobile = useIsMobile();
  const { addCustomEvent, lastCreatedManualEventDefaults } = useScheduleStore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate,
  );
  const [startTimeValue, setStartTimeValue] = useState("09:00");
  const [endTimeValue, setEndTimeValue] = useState("10:00");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customHexColor, setCustomHexColor] = useState("#3B82F6");
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const previousStartTimeValueRef = useRef(startTimeValue);
  const minuteDigitsTypedRef = useRef(0);
  const lastStartKeyRef = useRef<string | null>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultName = lastCreatedManualEventDefaults?.name ?? "";
    const defaultLocation = lastCreatedManualEventDefaults?.location ?? "";
    const defaultColor = lastCreatedManualEventDefaults?.color ?? "";
    const defaultHexColor = defaultColor
      ? (RealizationColorUtils.rgbToHex(defaultColor) ?? "#3B82F6")
      : "#3B82F6";

    setSelectedDate(initialDate);
    setStartTimeValue("09:00");
    setEndTimeValue("10:00");
    setName(defaultName);
    setLocation(defaultLocation);
    setSelectedColor(defaultColor);
    setCustomHexColor(defaultHexColor);
    setError(null);
    previousStartTimeValueRef.current = "09:00";
    minuteDigitsTypedRef.current = 0;
    lastStartKeyRef.current = null;
  }, [open, initialDate, lastCreatedManualEventDefaults]);

  const focusEndTimeField = () => {
    if (document.activeElement !== startTimeRef.current) {
      return;
    }
    setTimeout(() => {
      endTimeRef.current?.focus();
      endTimeRef.current?.select();
    }, 0);
  };

  const handleStartTimeChange = (nextValue: string) => {
    const previousValue = previousStartTimeValueRef.current;
    const key = lastStartKeyRef.current;

    setStartTimeValue(nextValue);
    previousStartTimeValueRef.current = nextValue;

    if (!key || !/^\d$/.test(key)) {
      minuteDigitsTypedRef.current = 0;
      return;
    }

    if (!isValidTimeValue(previousValue) || !isValidTimeValue(nextValue)) {
      minuteDigitsTypedRef.current = 0;
      return;
    }

    const previousHours = previousValue.slice(0, 2);
    const previousMinutes = previousValue.slice(3, 5);
    const nextHours = nextValue.slice(0, 2);
    const nextMinutes = nextValue.slice(3, 5);

    const hoursChanged = previousHours !== nextHours;
    const minutesChanged = previousMinutes !== nextMinutes;

    if (hoursChanged && !minutesChanged) {
      minuteDigitsTypedRef.current = 0;
      return;
    }

    if (!minutesChanged) {
      return;
    }

    minuteDigitsTypedRef.current = Math.min(
      2,
      minuteDigitsTypedRef.current + 1,
    );

    const firstMinuteDigitAboveSix =
      minuteDigitsTypedRef.current === 1 && Number(key) > 6;

    if (minuteDigitsTypedRef.current >= 2 || firstMinuteDigitAboveSix) {
      focusEndTimeField();
      minuteDigitsTypedRef.current = 0;
    }
  };

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

  const handleCreate = () => {
    if (!selectedDate) {
      setError(t("createEventDialog.errors.missingDate"));
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("createEventDialog.errors.missingName"));
      return;
    }

    const nextStart = mergeDateAndTime(selectedDate, startTimeValue);
    const nextEnd = mergeDateAndTime(selectedDate, endTimeValue);
    if (nextEnd <= nextStart) {
      setError(t("createEventDialog.errors.invalidRange"));
      return;
    }

    const customColor =
      selectedColor && RealizationColorUtils.isValidRgbColor(selectedColor)
        ? selectedColor
        : undefined;

    addCustomEvent({
      title: trimmedName,
      location: location.trim() || undefined,
      startTime: nextStart,
      endTime: nextEnd,
      source: "manual",
      color: customColor,
    });

    onOpenChange(false);
  };

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="create-event-name"
          className="text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("createEventDialog.nameLabel")}
        </label>
        <Input
          id="create-event-name"
          value={name}
          onChange={(eventInput) => setName(eventInput.target.value)}
          placeholder={t("createEventDialog.namePlaceholder")}
          className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30"
        />
      </div>

      <div className="space-y-2">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {t("createEventDialog.dateLabel")}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>
                {selectedDate
                  ? format(selectedDate, "PPP")
                  : t("createEventDialog.pickDate")}
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
            htmlFor="create-event-start"
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("createEventDialog.startTimeLabel")}
          </label>
          <Input
            id="create-event-start"
            type="time"
            ref={startTimeRef}
            value={startTimeValue}
            onFocus={() => {
              minuteDigitsTypedRef.current = 0;
              lastStartKeyRef.current = null;
              previousStartTimeValueRef.current = startTimeValue;
            }}
            onBlur={() => {
              minuteDigitsTypedRef.current = 0;
              lastStartKeyRef.current = null;
            }}
            onKeyDown={(eventInput) => {
              lastStartKeyRef.current = eventInput.key;
              if (!/^\d$/.test(eventInput.key)) {
                if (
                  eventInput.key === "Backspace" ||
                  eventInput.key === "Delete"
                ) {
                  minuteDigitsTypedRef.current = 0;
                }
              }
            }}
            onChange={(eventInput) =>
              handleStartTimeChange(eventInput.target.value)
            }
            className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="create-event-end"
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("createEventDialog.endTimeLabel")}
            {durationLabel ? ` (${durationLabel})` : ""}
          </label>
          <Input
            id="create-event-end"
            type="time"
            ref={endTimeRef}
            value={endTimeValue}
            onChange={(eventInput) => setEndTimeValue(eventInput.target.value)}
            className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30 [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="advanced-options" className="border-t border-b-0">
          <AccordionTrigger className="py-3 text-sm text-[var(--color-text-secondary)] hover:no-underline">
            {t("createEventDialog.moreOptions")}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-0">
            <div className="space-y-2">
              <label
                htmlFor="create-event-location"
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("createEventDialog.locationLabel")}
              </label>
              <Input
                id="create-event-location"
                value={location}
                onChange={(eventInput) => setLocation(eventInput.target.value)}
                placeholder={t("createEventDialog.locationPlaceholder")}
                className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-event-color"
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("createEventDialog.colorLabel")}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_COLORS.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${ScheduleUtils.lightenRgbColor(color)} 100%)`,
                        borderColor: isSelected
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                      }}
                      title={color}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <label
                htmlFor="create-event-color"
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {tColor("dialog.customColorLabel")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="create-event-color"
                  type="color"
                  value={customHexColor}
                  onChange={(eventInput) => {
                    const nextHex = eventInput.target.value;
                    setCustomHexColor(nextHex);
                    const rgbColor = RealizationColorUtils.hexToRgb(nextHex);
                    if (rgbColor) {
                      setSelectedColor(rgbColor);
                    }
                  }}
                  className="h-10 w-12 rounded border border-[var(--color-border-alpha-30)] bg-[var(--color-surface)] cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedColor("");
                    setCustomHexColor("#3B82F6");
                  }}
                  className="ml-auto"
                >
                  {t("createEventDialog.colorDefault")}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[90dvh] max-h-[90dvh] border-[var(--color-border-alpha-30)] bg-[var(--color-surface)] p-0 text-foreground">
          <DrawerHeader className="shrink-0 items-start px-6 pb-3 !text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:!text-left">
            <DrawerTitle className="w-full text-left text-xl font-bold text-foreground">
              {t("createEventDialog.title")}
            </DrawerTitle>
            <p className="w-full text-sm text-muted-foreground text-left">
              {t("createEventDialog.description")}
            </p>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            {content}
          </div>
          <DrawerFooter className="shrink-0 border-t border-[var(--color-border-alpha-30)] px-6 pt-4 pb-6">
            <ActionButton onClick={() => onOpenChange(false)} variant="subtle">
              {t("createEventDialog.cancel")}
            </ActionButton>
            <ActionButton onClick={handleCreate} variant="primary">
              {t("createEventDialog.create")}
            </ActionButton>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createEventDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("createEventDialog.description")}
          </DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          <ActionButton
            onClick={() => onOpenChange(false)}
            variant="subtle"
            className="w-full sm:w-auto"
          >
            {t("createEventDialog.cancel")}
          </ActionButton>
          <ActionButton
            onClick={handleCreate}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {t("createEventDialog.create")}
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
