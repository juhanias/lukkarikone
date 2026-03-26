import { Calendar, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { cn } from "../lib/utils";
import { useSettingsDialogParam } from "../hooks/useDialogParams";
import useConfigStore, { useCalendarStore } from "../state/state-management";
import { SettingsPanel } from "./SettingsPanel";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export default function Layout() {
  const { t } = useTranslation("settings");
  const location = useLocation();
  const navigate = useNavigate();
  const { calendarId } = useParams<{ calendarId: string }>();
  const { getActiveCalendar } = useCalendarStore();
  const { config, isCurrentThemeLight } = useConfigStore();
  const [settingsDialogParam, setSettingsDialogParam] = useSettingsDialogParam();
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  const activeCalendar = getActiveCalendar();
  const calendarPath = calendarId || activeCalendar?.id || "";
  const isSettingsRoute = location.pathname === "/app/settings";
  const isSettingsModalOpen =
    isDesktop && settingsDialogParam === "true" && !isSettingsRoute;
  const isCalendarRouteActive =
    location.pathname.startsWith("/app/") && location.pathname !== "/app/settings";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateDesktopState = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    updateDesktopState();
    mediaQuery.addEventListener("change", updateDesktopState);

    return () => mediaQuery.removeEventListener("change", updateDesktopState);
  }, []);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDesktop && !isSettingsRoute) {
      setSettingsDialogParam(settingsDialogParam === "true" ? null : "true");
      return;
    }

    if (isSettingsRoute) {
      if (calendarPath) {
        navigate(`/app/${calendarPath}`);
      }
    } else {
      navigate("/app/settings");
    }
  };

  return (
    <div
      className={cn(
        "bg-background text-foreground w-full h-full flex flex-col min-w-[320px]",
        config.font === "lexend"
          ? "font-[var(--font-lexend)]"
          : "font-[var(--font-system)]",
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "p-4 flex gap-4 justify-between items-center flex-shrink-0 border-b border-[var(--color-border-alpha-30)]",
          isCurrentThemeLight()
            ? "bg-[var(--color-header-background)]"
            : "bg-[var(--color-surface-alpha-40)]",
        )}
      >
        <div className="w-full max-w-7xl mx-auto flex gap-4 justify-between items-center">
          <Link
            to="/?landing"
            className="text-xl font-medium transition-colors hover:opacity-80 text-[var(--color-header-text)]"
          >
            juh.fi/lukkari
          </Link>
          <nav className="flex gap-4 items-center">
            {/* Calendar and Settings buttons (menu placed last) */}
            {calendarPath && (
              <Link to={`/app/${calendarPath}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                    isCalendarRouteActive
                      ? "bg-[var(--color-header-accent)] text-white hover:brightness-95"
                      : "text-[var(--color-header-text)] border border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-20)]",
                  )}
                >
                  <Calendar size={18} />
                </Button>
              </Link>
            )}
            <Button
              onClick={handleSettingsClick}
              variant="ghost"
              size="sm"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                isSettingsRoute || isSettingsModalOpen
                  ? "bg-[var(--color-header-accent)] text-white hover:brightness-95"
                  : "text-[var(--color-header-text)] border border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-20)]",
              )}
            >
              <Settings size={18} />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      <Dialog
        open={isSettingsModalOpen}
        onOpenChange={(open) => setSettingsDialogParam(open ? "true" : null)}
      >
        <DialogContent
          className="w-[calc(100vw-2rem)] max-w-[1200px] h-[88vh] sm:max-w-[1200px] p-0 overflow-hidden rounded-lg bg-[var(--color-surface-alpha-40)] backdrop-blur-sm"
        >
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
          <SettingsPanel mode="modal" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
