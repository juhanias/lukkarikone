import { useEffect } from "react";
import useConfigStore from "../state/state-management";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const currentThemeId = useConfigStore((state) => state.config.theme);
  const currentFontId = useConfigStore((state) => state.config.font);

  useEffect(() => {
    document.documentElement.dataset.theme = currentThemeId;
    document.documentElement.dataset.font = currentFontId;
  }, [currentThemeId, currentFontId]);

  return <>{children}</>;
}
