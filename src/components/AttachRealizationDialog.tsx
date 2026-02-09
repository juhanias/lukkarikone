import { Search, Unlink } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RealizationApiService } from "../services/realizationApi";
import {
  useEventMetadataStore,
  useScheduleStore,
} from "../state/state-management";
import type { ScheduleEvent } from "../types/schedule";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface AttachRealizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
}

interface RealizationOption {
  code: string;
  title: string;
}

const AttachRealizationDialog = ({
  open,
  onOpenChange,
  event,
}: AttachRealizationDialogProps) => {
  const { t } = useTranslation("dialogs");
  const [query, setQuery] = useState("");
  const { events } = useScheduleStore();
  const {
    getEventMetadata,
    setEventAttachedRealization,
    clearEventAttachedRealization,
  } = useEventMetadataStore();

  const attachedRealizationId = event
    ? (getEventMetadata(event.id)?.attachedRealizationId ?? null)
    : null;

  const realizationOptions = useMemo<RealizationOption[]>(() => {
    const map = new Map<string, RealizationOption>();

    events.forEach((calendarEvent) => {
      const code = RealizationApiService.extractRealizationCode(
        calendarEvent.title,
      );
      if (!code) {
        return;
      }
      const title = RealizationApiService.stripRealizationCode(
        calendarEvent.title,
      );
      const existing = map.get(code);
      if (!existing || (!existing.title && title)) {
        map.set(code, {
          code,
          title: title || calendarEvent.title,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.title || a.code).localeCompare(b.title || b.code),
    );
  }, [events]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return realizationOptions;
    }
    return realizationOptions.filter((option) => {
      const titleMatch = option.title.toLowerCase().includes(normalizedQuery);
      const codeMatch = option.code.toLowerCase().includes(normalizedQuery);
      return titleMatch || codeMatch;
    });
  }, [realizationOptions, normalizedQuery]);

  const handleAttach = (code: string) => {
    if (!event) {
      return;
    }
    setEventAttachedRealization(event.id, code);
    onOpenChange(false);
  };

  const handleDetach = () => {
    if (!event) {
      return;
    }
    clearEventAttachedRealization(event.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {t("lectureDetailsDialog.attachRealization.title")}
          </DialogTitle>
          <DialogDescription>
            {t("lectureDetailsDialog.attachRealization.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("lectureDetailsDialog.attachRealization.search")}
              className="pl-9 border-[var(--color-border-alpha-30)] focus-visible:border-[var(--color-accent)]"
            />
          </div>

          {attachedRealizationId && (
            <div
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              style={{
                backgroundColor: "var(--color-surface-alpha-40)",
                borderColor: "var(--color-border-alpha-30)",
              }}
            >
              <div className="text-sm">
                <div style={{ color: "var(--color-text-secondary)" }}>
                  {t("lectureDetailsDialog.attachRealization.current")}
                </div>
                <div style={{ color: "var(--color-text)" }}>
                  {attachedRealizationId.toUpperCase()}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleDetach}
              >
                <Unlink className="h-4 w-4" />
                {t("lectureDetailsDialog.attachRealization.detach")}
              </Button>
            </div>
          )}

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredOptions.length === 0 && (
              <div
                className="rounded-md border px-3 py-4 text-sm text-center"
                style={{
                  backgroundColor: "var(--color-surface-alpha-40)",
                  borderColor: "var(--color-border-alpha-30)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("lectureDetailsDialog.attachRealization.empty")}
              </div>
            )}

            {filteredOptions.map((option) => {
              const isAttached =
                attachedRealizationId?.toLowerCase() === option.code;
              return (
                <div
                  key={option.code}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  style={{
                    backgroundColor: "var(--color-surface-alpha-40)",
                    borderColor: "var(--color-border-alpha-30)",
                  }}
                >
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--color-text)" }}
                    >
                      {option.title || option.code.toUpperCase()}
                    </div>
                    <div
                      className="text-xs uppercase"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {option.code}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isAttached ? "secondary" : "default"}
                    disabled={isAttached}
                    onClick={() => handleAttach(option.code)}
                  >
                    {isAttached
                      ? t("lectureDetailsDialog.attachRealization.attached")
                      : t("lectureDetailsDialog.attachRealization.attach")}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachRealizationDialog;
