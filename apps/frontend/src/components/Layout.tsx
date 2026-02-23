import { Calendar, Settings } from "lucide-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useConfigStore, { useCalendarStore } from "../state/state-management";
import { Button } from "./ui/button";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { calendarId } = useParams<{ calendarId: string }>();
  const { getActiveCalendar } = useCalendarStore();
  const { config, isCurrentThemeLight } = useConfigStore();

  const activeCalendar = getActiveCalendar();
  const calendarPath = calendarId || activeCalendar?.id || "";

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/app/settings") {
      if (calendarPath) {
        navigate(`/app/${calendarPath}`);
      }
    } else {
      navigate("/app/settings");
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col min-w-[320px]"
      style={{
        fontFamily:
          config.font === "lexend"
            ? "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      {/* Header */}
      <header
        className="p-4 flex gap-4 justify-between items-center flex-shrink-0"
        style={{
          backgroundColor: isCurrentThemeLight()
            ? "var(--color-header-background)"
            : "var(--color-surface-alpha-40)", // Match day/week switcher background for dark themes
          borderBottom: "1px solid var(--color-border-alpha-30)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto flex gap-4 justify-between items-center">
          <Link
            to="/?landing"
            className="text-xl font-medium transition-colors hover:opacity-80"
            style={{
              color: "var(--color-header-text)",
            }}
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
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  style={{
                    backgroundColor:
                      location.pathname.startsWith("/app/") &&
                      location.pathname !== "/app/settings"
                        ? "var(--color-header-accent)"
                        : "transparent",
                    color:
                      location.pathname.startsWith("/app/") &&
                      location.pathname !== "/app/settings"
                        ? "white"
                        : "var(--color-header-text)",
                    border:
                      location.pathname.startsWith("/app/") &&
                      location.pathname !== "/app/settings"
                        ? "none"
                        : "1px solid var(--color-border-alpha-30)",
                  }}
                >
                  <Calendar size={18} />
                </Button>
              </Link>
            )}
            <Button
              onClick={handleSettingsClick}
              variant="ghost"
              size="sm"
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor:
                  location.pathname === "/app/settings"
                    ? "var(--color-header-accent)"
                    : "transparent",
                color:
                  location.pathname === "/app/settings"
                    ? "white"
                    : "var(--color-header-text)",
                border:
                  location.pathname === "/app/settings"
                    ? "none"
                    : "1px solid var(--color-border-alpha-30)",
              }}
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
    </div>
  );
}
