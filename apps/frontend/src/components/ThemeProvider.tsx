import { useEffect } from "react";
import useConfigStore from "../state/state-management";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const currentThemeId = useConfigStore((state) => state.config.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = currentThemeId;
  }, [currentThemeId]);

  return <>{children}</>;
}
