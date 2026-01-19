export type Font = "system" | "lexend";

export interface FontOption {
  value: Font;
  label: string;
  subtitle: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    value: "system",
    label: "Järjestelmäfontti",
    subtitle: "Käyttää laitteen oletusfonttia",
  },
  {
    value: "lexend",
    label: "Lexend-fontti",
    subtitle: "Optimoitu luettavuudelle",
  },
] as const;
