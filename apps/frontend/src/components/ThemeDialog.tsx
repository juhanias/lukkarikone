import { ChevronDown, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeDialogParam } from "../hooks/useDialogParams";
import useConfigStore from "../state/state-management";
import { ThemeSelector } from "./ThemeSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function ThemeDialog() {
  const [themeParam, setThemeParam] = useThemeDialogParam();
  const { t } = useTranslation("settings");
  const { config, setConfig, getListedThemes } = useConfigStore();
  const listedThemes = getListedThemes();

  const isOpen = themeParam === "true";

  const transformedThemes = listedThemes.map((theme) => ({
    id: theme.id,
    name: theme.nameKey ? t(theme.nameKey) : theme.name || theme.id,
    description: theme.descriptionKey
      ? t(theme.descriptionKey)
      : theme.description || "",
    colors: {
      background: theme.colors.background,
      surface: theme.colors.surface,
      accent: theme.colors.accent,
      accentSecondary: theme.colors.accentSecondary,
      text: theme.colors.text,
    },
  }));

  return (
    <>
      <button
        onClick={() => setThemeParam("true")}
        className="flex items-center justify-between gap-2 h-9 px-3 rounded-md border transition-colors w-full sm:w-auto sm:min-w-[180px] cursor-pointer hover:opacity-90"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <span className="flex items-center gap-2 text-sm whitespace-nowrap">
          <Palette className="w-4 h-4" />
          {t("sections.styling.theme.customize")}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50" />
      </button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => setThemeParam(open ? "true" : null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("sections.styling.themeDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("sections.styling.themeDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ThemeSelector
              themes={transformedThemes}
              selectedThemeId={config.theme}
              onThemeSelect={(themeId) => {
                setConfig({ theme: themeId });
                setThemeParam(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
