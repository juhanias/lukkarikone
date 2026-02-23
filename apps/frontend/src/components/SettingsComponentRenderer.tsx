import type { SettingComponent } from "../types/settings-config";
import { ThemeSelector } from "./ThemeSelector";
import { RadioCard, Toggle } from "./ui";
import { Slider } from "./ui/Slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SettingsComponentRendererProps {
  component: SettingComponent;
}

export function SettingsComponentRenderer({
  component,
}: SettingsComponentRendererProps) {
  switch (component.componentType) {
    case "toggle":
      return (
        <Toggle
          checked={component.data.checked}
          onChange={component.data.onChange}
          label={component.data.label}
          subtitle={component.data.subtitle}
        />
      );

    case "radio":
      return (
        <fieldset className="space-y-4">
          <legend className="sr-only">{component.data.name}</legend>
          {component.data.options.map((option) => (
            <RadioCard
              key={option.value}
              name={component.data.name}
              value={option.value}
              checked={option.checked}
              onChange={component.data.onChange}
              label={option.label}
              subtitle={option.subtitle}
            />
          ))}
        </fieldset>
      );

    case "slider":
      return (
        <div className="p-4 rounded-lg mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0 mr-4">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                {component.data.label}
              </label>
              <p
                className="text-xs mt-1 opacity-75 max-w-2xl"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {component.data.subtitle}
              </p>
            </div>
            <div className="font-mono text-sm px-2 py-1 rounded border bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)]">
              {component.data.value}
              {component.data.unit || ""}
            </div>
          </div>
          <div className="relative">
            <Slider
              value={[component.data.value]}
              onValueChange={(value) => component.data.onChange(value[0])}
              min={component.data.min}
              max={component.data.max}
              step={component.data.step}
              className="w-full opacity-slider-themed"
            />
          </div>
        </div>
      );

    case "select":
      return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]">
          <div className="flex-1 min-w-0">
            <label className="text-sm font-medium text-[var(--color-text)] block">
              {component.data.label}
            </label>
            {component.data.subtitle && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {component.data.subtitle}
              </p>
            )}
          </div>
          <Select
            value={component.data.value}
            onValueChange={component.data.onChange}
          >
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px] cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {component.data.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "button": {
      const isDanger = component.data.variant === "danger";
      const Icon = component.data.icon;

      return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg mt-4 border transition-colors bg-[var(--color-surface-secondary-alpha-30)] border-[var(--color-border-alpha-30)] hover:bg-[var(--color-surface-secondary-alpha-40)]">
          <div className="flex-1 min-w-0">
            <label
              className="text-sm font-medium block"
              style={{ color: "var(--color-text)" }}
            >
              {component.data.label}
            </label>
            {component.data.subtitle && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {component.data.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={component.data.onClick}
            className="flex items-center justify-center gap-2 h-9 px-3 rounded-md border transition-colors w-full sm:w-auto sm:min-w-[180px] cursor-pointer hover:opacity-90"
            style={{
              borderColor: isDanger ? "#ef4444" : "var(--color-border)",
              color: isDanger ? "#ef4444" : "var(--color-text)",
              backgroundColor: isDanger
                ? "rgba(239,68,68,0.15)"
                : "var(--color-surface)",
            }}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="text-sm whitespace-nowrap">
              {component.data.label}
            </span>
          </button>
        </div>
      );
    }

    case "theme-selector":
      return (
        <ThemeSelector
          themes={component.data.themes}
          selectedThemeId={component.data.selectedThemeId}
          onThemeSelect={component.data.onThemeSelect}
        />
      );

    case "custom":
      return <>{component.data.render()}</>;

    default:
      return null;
  }
}
