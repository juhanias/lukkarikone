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
        type="button"
        onClick={() => setThemeParam("true")}
        className="border-border bg-card text-foreground hover:bg-secondary/30 focus-visible:ring-ring/50 flex items-center justify-between gap-2 h-9 px-3 rounded-md border transition-colors w-full sm:w-auto sm:min-w-[180px] cursor-pointer focus-visible:ring-[3px] outline-none"
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
        <DialogContent className="w-[calc(100%-1rem)] max-w-2xl max-h-[85vh] overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{t("sections.styling.themeDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("sections.styling.themeDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] overflow-y-auto overscroll-contain pr-1 sm:max-h-[65vh] sm:pr-2">
            <ThemeSelector
              themes={transformedThemes}
              selectedThemeId={config.theme}
              showNames
              onThemeSelect={(themeId) => {
                setConfig({ theme: themeId });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
