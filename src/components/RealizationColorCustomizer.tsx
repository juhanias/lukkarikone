import { motion } from "framer-motion";
import { Check, Palette, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRealizationColorStore } from "../state/state-management";
import { RealizationColorUtils } from "../utils/realization-color-utils";
import { ScheduleUtils } from "../utils/schedule-utils";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RealizationColorCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  realizationCode: string;
  currentEventTitle: string;
}

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
  realizationCode,
  currentEventTitle,
}: RealizationColorCustomizerProps) => {
  const { t } = useTranslation("colorCustomization");
  const {
    customColors,
    setRealizationColor,
    resetRealizationColor,
    hasCustomColor,
  } = useRealizationColorStore();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [customHexColor, setCustomHexColor] = useState("#3B82F6");

  const effectiveColor = RealizationColorUtils.getEffectiveColor(
    realizationCode,
    customColors,
  );
  const isCustomized = hasCustomColor(realizationCode);

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
      setRealizationColor(realizationCode, selectedColor);
      onOpenChange(false);
    }
  };

  const handleReset = () => {
    resetRealizationColor(realizationCode);
    setSelectedColor("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedColor("");
    onOpenChange(false);
  };

  const previewColorPair = RealizationColorUtils.getEffectiveColorPair(
    realizationCode,
    {
      ...customColors,
      ...(selectedColor ? { [realizationCode]: selectedColor } : {}),
    },
  );

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
            {t("dialog.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Event Info */}
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "var(--color-surface-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            <h4
              className="font-semibold text-sm mb-1"
              style={{ color: "var(--color-text)" }}
            >
              {currentEventTitle}
            </h4>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {t("dialog.colorPreviewLabel")}
            </label>
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
                    {t("dialog.sampleEventText", { code: realizationCode })}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Preset Colors Grid */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              {t("dialog.selectColorLabel")}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => {
                const isSelected = selectedColor === color;
                const isCurrentColor =
                  effectiveColor === color && !selectedColor;

                return (
                  <button
                    key={color}
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
            >
              {t("dialog.customColorLabel")}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customHexColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-16 h-10 rounded border cursor-pointer"
                style={{ borderColor: "var(--color-border)" }}
              />
              <Button
                onClick={() => handleCustomColorChange(customHexColor)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {t("dialog.buttons.useCustomColor")}
              </Button>
            </div>
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
