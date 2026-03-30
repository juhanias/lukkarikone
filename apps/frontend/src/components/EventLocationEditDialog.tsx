import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEventMetadataStore } from "../state/state-management";
import type { ScheduleEvent } from "../types/schedule";
import { ActionButton } from "./ui/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface EventLocationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
}

const EventLocationEditDialog = ({
  open,
  onOpenChange,
  event,
}: EventLocationEditDialogProps) => {
  const { t } = useTranslation("dialogs");
  const { getEventMetadata, setEventMetadata } = useEventMetadataStore();
  const [locationValue, setLocationValue] = useState("");

  useEffect(() => {
    if (!open || !event) {
      return;
    }

    const metadataLocation = getEventMetadata(event.id)?.location;
    setLocationValue(metadataLocation ?? event.location ?? "");
  }, [event, getEventMetadata, open]);

  const handleSave = () => {
    if (!event) {
      return;
    }

    setEventMetadata(event.id, { location: locationValue.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("eventLocationEditDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("eventLocationEditDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="event-location-edit"
              className="text-sm font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("createEventDialog.locationLabel")}
            </label>
            <Input
              id="event-location-edit"
              value={locationValue}
              onChange={(eventInput) =>
                setLocationValue(eventInput.target.value)
              }
              onKeyDown={(eventInput) => {
                if (eventInput.key === "Enter") {
                  eventInput.preventDefault();
                  handleSave();
                }
              }}
              placeholder={t("createEventDialog.locationPlaceholder")}
              className="bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)] focus-visible:border-[var(--color-accent)] focus-visible:ring-[var(--color-accent)]/30"
            />
          </div>

          <DialogFooter>
            <ActionButton
              type="button"
              onClick={() => onOpenChange(false)}
              variant="subtle"
              className="w-full sm:w-auto"
            >
              {t("eventLocationEditDialog.cancel")}
            </ActionButton>
            <ActionButton
              type="button"
              onClick={handleSave}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {t("eventLocationEditDialog.save")}
            </ActionButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventLocationEditDialog;
