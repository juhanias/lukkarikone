import { motion } from "framer-motion";
import { Check, Palette, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useEventMetadataStore,
  useRealizationMetadataStore,
} from "../state/state-management";
import { RealizationColorUtils } from "../utils/realization-color-utils";
import { ScheduleUtils } from "../utils/schedule-utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RealizationColorCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  eventTitleRaw: string;
  realizationCode: string;
  realizationTitle: string;
}

type ColorScope = "event" | "realization";

const PRESET_COLORS = [
  "rgb(30, 64, 175)", // blue
  "rgb(88, 28, 135)", // purple
  "rgb(22, 101, 52)", // green
  "rgb(194, 65, 12)", // orange
  "rgb(13, 148, 136)", // teal
  "rgb(67, 56, 202)", // indigo
  "rgb(185, 28, 28)", // red
  "rgb(180, 83, 9)", // amber
  "rgb(71, 85, 105)", // slate
  "rgb(75, 85, 99)", // gray
  "rgb(5, 150, 105)", // emerald
  "rgb(190, 18, 60)", // rose
  "rgb(8, 145, 178)", // cyan
  "rgb(124, 58, 237)", // violet
  "rgb(101, 163, 13)", // lime
  "rgb(7, 89, 133)", // sky
];

export const RealizationColorCustomizer = ({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  eventTitleRaw,
  realizationCode,
  realizationTitle,
}: RealizationColorCustomizerProps) => {
  const { t } = useTranslation("colorCustomization");
  const {
    metadataByRealization,
    setRealizationColor,
    clearRealizationColor,
    hasRealizationColor,
  } = useRealizationMetadataStore();
  const { metadataByEvent, setEventColor, clearEventColor, hasEventColor } =
    useEventMetadataStore();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customHexColor, setCustomHexColor] = useState("#3B82F6");
  const hasRealization = Boolean(realizationCode);
  const [activeScope, setActiveScope] = useState<ColorScope>(
    hasRealization ? "realization" : "event",
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedColor("");
    setCustomHexColor("#3B82F6");
    setActiveScope(hasRealization ? "realization" : "event");
  }, [open, hasRealization]);

  const effectiveRealizationColor = hasRealization
    ? RealizationColorUtils.getEffectiveColor(
        realizationCode,
        metadataByRealization,
      )
    : ScheduleUtils.getDefaultRealizationColor(eventTitleRaw);
  const effectiveEventColor =
    metadataByEvent[eventId]?.color ||
    (hasRealization ? metadataByRealization[realizationCode]?.color : null) ||
    ScheduleUtils.getDefaultRealizationColor(eventTitleRaw);
  const effectiveColor =
    activeScope === "event" ? effectiveEventColor : effectiveRealizationColor;
  const isCustomized =
    activeScope === "event"
      ? hasEventColor(eventId)
      : hasRealization && hasRealizationColor(realizationCode);

  const handlePresetColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHexColor(hex);
    const rgbColor = RealizationColorUtils.hexToRgb(hex);
    if (rgbColor) {
      setSelectedColor(rgbColor);
    }
  };

  const handleApply = () => {
    if (selectedColor && RealizationColorUtils.isValidRgbColor(selectedColor)) {
      if (activeScope === "event") {
        setEventColor(eventId, selectedColor);
      } else if (hasRealization) {
        setRealizationColor(realizationCode, selectedColor);
      }
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    if (activeScope === "event") {
      clearEventColor(eventId);
    } else if (hasRealization) {
      clearRealizationColor(realizationCode);
    }
    setSelectedColor("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedColor("");
    onOpenChange(false);
  };

  const previewEventMetadata =
    selectedColor && activeScope === "event"
      ? {
          ...metadataByEvent,
          [eventId]: {
            ...metadataByEvent[eventId],
            color: selectedColor,
          },
        }
      : metadataByEvent;
  const previewRealizationMetadata =
    selectedColor && activeScope === "realization" && hasRealization
      ? {
          ...metadataByRealization,
          [realizationCode]: {
            ...metadataByRealization[realizationCode],
            color: selectedColor,
          },
        }
      : metadataByRealization;
  const previewColorPair = ScheduleUtils.getColorPair(
    eventTitleRaw,
    eventId,
    previewEventMetadata,
    previewRealizationMetadata,
  );
  const previewTitle =
    activeScope === "event" ? eventTitle : realizationTitle || eventTitle;

  const onScopeChange = (scope: ColorScope) => {
    setActiveScope(scope);
    setSelectedColor("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Palette
              className="h-5 w-5"
              style={{ color: "var(--color-accent)" }}
            />
            {previewTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scope Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onScopeChange("event")}
              className="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
              style={{
                backgroundColor:
                  activeScope === "event"
                    ? "var(--color-accent)"
                    : "var(--color-surface-secondary-alpha-30)",
                color: activeScope === "event" ? "white" : "var(--color-text)",
                border: "1px solid var(--color-border-alpha-30)",
              }}
            >
              {t("dialog.tabs.event")}
            </button>
            <button
              type="button"
              onClick={() => onScopeChange("realization")}
              className="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
              style={{
                backgroundColor:
                  activeScope === "realization"
                    ? "var(--color-accent)"
                    : "var(--color-surface-secondary-alpha-30)",
                color:
                  activeScope === "realization" ? "white" : "var(--color-text)",
                border: "1px solid var(--color-border-alpha-30)",
                opacity: hasRealization ? 1 : 0.5,
              }}
              disabled={!hasRealization}
            >
              {t("dialog.tabs.realization")}
            </button>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {t("dialog.colorPreviewLabel")}
            </div>
            <div className="relative">
              <motion.div
                className="h-16 rounded-lg shadow-sm"
                style={{
                  background: previewColorPair.normal,
                }}
                whileHover={{
                  background: previewColorPair.flipped,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-white font-medium text-sm">
                    {previewTitle}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Preset Colors Grid */}
          <div className="space-y-2">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {t("dialog.selectColorLabel")}
            </div>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                const isCurrentColor =
                  effectiveColor === color && !selectedColor;

                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetColorSelect(color)}
                    className="relative w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      background: `linear-gradient(135deg, ${color} 0%, ${ScheduleUtils.lightenRgbColor(color)} 100%)`,
                      borderColor:
                        isSelected || isCurrentColor
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                      transform:
                        isSelected || isCurrentColor
                          ? "scale(1.1)"
                          : "scale(1)",
                    }}
                    title={color}
                  >
                    {(isSelected || isCurrentColor) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Option */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
              htmlFor="custom-event-color"
            >
              {t("dialog.customColorLabel")}
            </label>
            <input
              id="custom-event-color"
              type="color"
              value={customHexColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleApply} disabled={!selectedColor} size="sm">
              <Check className="h-4 w-4" />
              {t("dialog.buttons.apply")}
            </Button>

            {isCustomized && (
              <Button onClick={handleReset} variant="destructive" size="sm">
                <RotateCcw className="h-4 w-4" />
                {t("dialog.buttons.resetToDefault")}
              </Button>
            )}

            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              <X className="h-4 w-4" />
              {t("dialog.buttons.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
