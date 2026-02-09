import { RealizationApiService } from "../services/realizationApi";
import type { RealizationMetadataMap } from "../types/metadata";
import { ScheduleUtils } from "./schedule-utils";

export class RealizationColorUtils {
  /**
   * Extracts all unique realization codes from a list of events
   */
  static getUniqueRealizationCodes(events: { title: string }[]): string[] {
    const codes = new Set<string>();

    events.forEach((event) => {
      const realizationCode = RealizationApiService.extractRealizationCode(
        event.title,
      );
      if (realizationCode) {
        codes.add(realizationCode);
      }
    });

    return Array.from(codes).sort();
  }

  /**
   * Gets the effective color for a realization code (custom or default)
   * @param realizationCode The realization code to get color for
   * @param metadataByRealization Record of realization metadata
   */
  static getEffectiveColor(
    realizationCode: string,
    metadataByRealization: RealizationMetadataMap,
  ): string {
    return (
      metadataByRealization[realizationCode]?.color ||
      ScheduleUtils.getDefaultRealizationColor(realizationCode)
    );
  }

  /**
   * Gets the effective color pair for a realization code (custom or default)
   * @param realizationCode The realization code to get color pair for
   * @param metadataByRealization Record of realization metadata
   */
  static getEffectiveColorPair(
    realizationCode: string,
    metadataByRealization: RealizationMetadataMap,
  ): { normal: string; flipped: string } {
    const primaryColor = metadataByRealization[realizationCode]?.color;
    if (primaryColor) {
      const secondaryColor = ScheduleUtils.lightenRgbColor(primaryColor);
      return {
        normal: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        flipped: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
      };
    }

    return ScheduleUtils.getDefaultColorPair(realizationCode);
  }

  /**
   * Validates if a color string is a valid RGB color
   */
  static isValidRgbColor(color: string): boolean {
    const rgbRegex =
      /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/;
    const match = color.match(rgbRegex);

    if (!match) return false;

    const [, r, g, b] = match.map(Number);
    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
  }

  /**
   * Converts hex color to RGB format
   */
  static hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return null;
  }

  /**
   * Converts RGB color to hex format
   */
  static rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;

    const [, r, g, b] = match.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}
