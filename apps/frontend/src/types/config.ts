export type Font = "gabarito-open-sans" | "system" | "lexend";

export interface FontOption {
  value: Font;
  label: string;
  subtitle: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "gabarito-open-sans",
    label: "Gabarito (default)",
    subtitle: "The default branding of Open Lukkari",
  },
  {
    value: "system",
    label: "System Font",
    subtitle: "Uses device default font",
  },
  {
    value: "lexend",
    label: "Lexend Font",
    subtitle: "Optimized for readability and accessibility",
  },
] as const;
