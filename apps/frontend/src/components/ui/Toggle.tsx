import { Switch } from "./switch";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  subtitle,
  disabled = false,
}: ToggleProps) {
  const handleContainerClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleSwitchClick = (e: React.MouseEvent) => {
    // Prevent the container click from firing when clicking directly on the switch
    e.stopPropagation();
  };

  return (
    <div
      className="w-full flex items-center justify-between p-4 rounded-lg cursor-pointer mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]"
      onClick={handleContainerClick}
      style={{
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div className="flex-1 min-w-0 mr-4">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          {label}
        </span>
        {subtitle && (
          <p
            className="text-xs mt-1 max-w-2xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div onClick={handleSwitchClick}>
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </div>
  );
}
