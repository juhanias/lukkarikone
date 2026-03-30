import {
  Calendar,
  Check,
  Edit2,
  Link as LinkIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PRESET_CALENDARS } from "@/lib/preset-calendars";
import { useIsMobile } from "../hooks/useIsMobile";
import { useCalendarStore, useConfigStore } from "../state/state-management";
import type { Calendar as CalendarType } from "../types/calendar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

interface CalendarManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarManagementDialog = ({
  open,
  onOpenChange,
}: CalendarManagementDialogProps) => {
  const { t } = useTranslation("common");
  const { t: tSettings } = useTranslation("settings");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { config, setConfig } = useConfigStore();
  const {
    calendars,
    activeCalendarId,
    addCalendar,
    updateCalendar,
    deleteCalendar,
    setActiveCalendar,
    addIcalUrl,
    removeIcalUrl,
    updateIcalUrl,
  } = useCalendarStore();

  const [editingCalendarId, setEditingCalendarId] = useState<string | null>(
    null,
  );
  const [editingCalendarName, setEditingCalendarName] = useState("");
  const [editingUrlState, setEditingUrlState] = useState<{
    calendarId: string;
    oldUrl: string;
    newUrl: string;
  } | null>(null);
  const [newUrlState, setNewUrlState] = useState<{
    calendarId: string;
    url: string;
  } | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const calendarRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCreateCalendar = () => {
    // Generate a default name based on the current number of calendars
    const calendarIndex = calendars.length + 1;
    const defaultName = `Calendar ${calendarIndex}`;
    const id = addCalendar(defaultName);
    setNewlyCreatedId(id);
    // Remove the highlight after animation completes
    setTimeout(() => setNewlyCreatedId(null), 1000);
    // Optionally set as active
    if (calendars.length === 0) {
      setActiveCalendar(id);
      navigate(`/app/${id}`);
    }
  };

  const handleUpdateCalendarName = (calendarId: string) => {
    if (editingCalendarName.trim()) {
      updateCalendar(calendarId, { name: editingCalendarName.trim() });
      setEditingCalendarId(null);
      setEditingCalendarName("");
    }
  };

  const handleDeleteCalendar = (calendar: CalendarType) => {
    if (calendar.icalUrls.length === 0) {
      deleteCalendar(calendar.id);
      return;
    }

    if (
      confirm(
        t("calendars.confirmDelete") ||
          "Are you sure you want to delete this calendar?",
      )
    ) {
      deleteCalendar(calendar.id);
    }
  };

  const handleAddUrl = (calendarId: string) => {
    if (newUrlState?.url.trim()) {
      addIcalUrl(calendarId, newUrlState.url.trim());
      setNewUrlState(null);
    }
  };

  const handleUpdateUrl = () => {
    if (editingUrlState?.newUrl.trim()) {
      updateIcalUrl(
        editingUrlState.calendarId,
        editingUrlState.oldUrl,
        editingUrlState.newUrl.trim(),
      );
      setEditingUrlState(null);
    }
  };

  const startEditingCalendar = (calendar: CalendarType) => {
    setEditingCalendarId(calendar.id);
    setEditingCalendarName(calendar.name);
  };

  const startEditingUrl = (calendarId: string, url: string) => {
    setEditingUrlState({ calendarId, oldUrl: url, newUrl: url });
  };

  useEffect(() => {
    if (!isMobile || !newlyCreatedId) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const target = calendarRefs.current[newlyCreatedId];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isMobile, newlyCreatedId]);

  const handleActivateCalendar = (calendarId: string) => {
    if (calendarId !== activeCalendarId) {
      setActiveCalendar(calendarId);
    }
    navigate(`/app/${calendarId}`);
    onOpenChange(false);
  };

  // Helper function to get preset name if URL matches a preset
  const getPresetName = (url: string): string | null => {
    const preset = PRESET_CALENDARS.find((p) => p.url === url);
    return preset ? preset.label : null;
  };

  const calendarManagementBody = (
    <div className="space-y-4 mt-4">
      <Button
        type="button"
        onClick={handleCreateCalendar}
        className="w-full sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        {t("calendars.createNew") || "New Calendar"}
      </Button>

      <div
        className="w-full flex items-center justify-between rounded-lg border p-4"
        style={{
          backgroundColor: "var(--color-surface-secondary-alpha-20)",
          borderColor: "var(--color-border-alpha-30)",
        }}
      >
        <div className="mr-4 min-w-0">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text)" }}
          >
            {tSettings("sections.view.allowCustomEvents.label")}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {tSettings("sections.view.allowCustomEvents.subtitle")}
          </p>
        </div>
        <Switch
          checked={config.allowCustomEvents}
          onCheckedChange={(checked) =>
            setConfig({ allowCustomEvents: checked })
          }
          aria-label={tSettings("sections.view.allowCustomEvents.label")}
        />
      </div>

      {/* Calendar List */}
      {calendars.map((calendar) => (
        <div
          key={calendar.id}
          ref={(element) => {
            calendarRefs.current[calendar.id] = element;
          }}
          className={`rounded-lg border p-4 space-y-3 transition-all duration-500 ${
            calendar.id === newlyCreatedId
              ? "animate-in slide-in-from-top-2 scale-in-95"
              : ""
          }`}
          style={{
            borderColor:
              calendar.id === newlyCreatedId
                ? "var(--color-accent)"
                : "var(--color-border)",
            backgroundColor:
              calendar.id === activeCalendarId
                ? "var(--color-accent-alpha-10)"
                : calendar.id === newlyCreatedId
                  ? "var(--color-accent-alpha-20)"
                  : "transparent",
            boxShadow:
              calendar.id === newlyCreatedId
                ? "0 4px 12px color-mix(in srgb, var(--color-accent) 20%, transparent)"
                : "none",
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              {editingCalendarId === calendar.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingCalendarName}
                    onChange={(e) => setEditingCalendarName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleUpdateCalendarName(calendar.id);
                      if (e.key === "Escape") {
                        setEditingCalendarId(null);
                        setEditingCalendarName("");
                      }
                    }}
                    placeholder={
                      t("calendars.calendarNamePlaceholder") || "Calendar name"
                    }
                    autoFocus
                    style={{
                      backgroundColor: "var(--color-surface-secondary)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateCalendarName(calendar.id);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCalendarId(null);
                      setEditingCalendarName("");
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleActivateCalendar(calendar.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--color-surface-secondary-alpha-20)]"
                  title={t("calendars.setActive") || "Switch to this calendar"}
                >
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--color-text)" }}
                  >
                    {calendar.name}
                  </h3>
                  {calendar.id === activeCalendarId && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "white",
                      }}
                    >
                      {t("calendars.active") || "Active"}
                    </span>
                  )}
                </button>
              )}
            </div>
            {editingCalendarId !== calendar.id && (
              <div className="flex items-center gap-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingCalendar(calendar);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCalendar(calendar);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* iCal URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("calendars.icalUrls") || "iCal URLs"} (
                {calendar.icalUrls.length})
              </span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewUrlState({ calendarId: calendar.id, url: "" });
                }}
                variant="ghost"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {calendar.icalUrls.map((url) => (
              <div
                key={url}
                className="flex items-center gap-2 p-2 rounded"
                style={{
                  backgroundColor: "var(--color-surface-secondary-alpha-20)",
                }}
              >
                {editingUrlState?.calendarId === calendar.id &&
                editingUrlState.oldUrl === url ? (
                  <>
                    <Input
                      value={editingUrlState.newUrl}
                      onChange={(e) =>
                        setEditingUrlState({
                          ...editingUrlState,
                          newUrl: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateUrl();
                        if (e.key === "Escape") setEditingUrlState(null);
                      }}
                      placeholder={
                        t("calendars.urlPlaceholder") || "https://..."
                      }
                      autoFocus
                      className="flex-1"
                      style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text)",
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateUrl();
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUrlState(null);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <LinkIcon
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: "var(--color-accent)" }}
                    />
                    <span
                      className="text-sm flex-1 font-mono break-all"
                      style={{
                        color: "var(--color-text)",
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                      }}
                      title={url}
                    >
                      {getPresetName(url) || url}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingUrl(calendar.id, url);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeIcalUrl(calendar.id, url);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {/* New URL Input */}
            {newUrlState?.calendarId === calendar.id && (
              <div
                className="space-y-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-surface-secondary-alpha-20)",
                  borderColor: "var(--color-border-alpha-30)",
                }}
              >
                {/* Preset URLs */}
                <div>
                  <p
                    className="text-xs font-medium mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t("calendars.quickAdd") || "Quick Add"}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {PRESET_CALENDARS.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addIcalUrl(calendar.id, preset.url);
                          setNewUrlState(null);
                        }}
                        className="text-xs h-7"
                        style={{
                          backgroundColor: "var(--color-surface-secondary)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <hr
                    style={{
                      flexGrow: 1,
                      borderColor: "var(--color-border-alpha-30)",
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t("actions.or") || "or"}
                  </span>
                  <hr
                    style={{
                      flexGrow: 1,
                      borderColor: "var(--color-border-alpha-30)",
                    }}
                  />
                </div>

                {/* Custom URL Input */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newUrlState.url}
                    onChange={(e) =>
                      setNewUrlState({
                        ...newUrlState,
                        url: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddUrl(calendar.id);
                      if (e.key === "Escape") setNewUrlState(null);
                    }}
                    placeholder={t("calendars.urlPlaceholder") || "https://..."}
                    autoFocus
                    className="flex-1"
                    style={{
                      backgroundColor: "var(--color-surface-secondary)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddUrl(calendar.id);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewUrlState(null);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {calendar.icalUrls.length === 0 && !newUrlState && (
              <p
                className="text-sm text-center py-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("calendars.noUrls") ||
                  "No iCal URLs yet. Add one to get started."}
              </p>
            )}
          </div>
        </div>
      ))}

      {calendars.length === 0 && (
        <div className="text-center py-8">
          <Calendar
            className="h-12 w-12 mx-auto mb-3 opacity-50"
            style={{ color: "var(--color-text-secondary)" }}
          />
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("calendars.empty") ||
              "No calendars yet. Create one to get started!"}
          </p>
        </div>
      )}
    </div>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90dvh] max-h-[90dvh] border-[var(--color-border-alpha-30)] bg-[var(--color-surface)] p-0 text-foreground">
        <DrawerHeader className="shrink-0 items-start px-6 pb-3 !text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:!text-left">
          <DrawerTitle
            className="flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Calendar
              className="h-5 w-5"
              style={{ color: "var(--color-accent)" }}
            />
            {t("calendars.title") || "Manage Calendars"}
          </DrawerTitle>
          <DrawerDescription
            className="text-left"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t("calendars.description") ||
              "Need to switch between schedules or overlay them? Create additional calendars here!"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {calendarManagementBody}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ color: "var(--color-text)" }}
          >
            <Calendar
              className="h-5 w-5"
              style={{ color: "var(--color-accent)" }}
            />
            {t("calendars.title") || "Manage Calendars"}
          </DialogTitle>
          <DialogDescription style={{ color: "var(--color-text-secondary)" }}>
            {t("calendars.description") ||
              "Need to switch between schedules or overlay them? Create additional calendars here!"}
          </DialogDescription>
        </DialogHeader>
        {calendarManagementBody}
      </DialogContent>
    </Dialog>
  );
};
