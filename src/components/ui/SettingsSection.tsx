import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  icon:
    | LucideIcon
    | React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle: string;
  variant?: "default" | "danger";
  children: ReactNode;
}

export function SettingsSection({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  subtitle,
  variant = "default",
  children,
}: SettingsSectionProps) {
  const isDanger = variant === "danger";

  return (
    <div
      className="backdrop-blur-sm rounded-xl p-6 shadow-xl transition-all duration-300"
      style={{
        backgroundColor: isDanger
          ? "rgba(239, 68, 68, 0.2)"
          : "var(--color-surface-alpha-40)",
        border: isDanger
          ? "1px solid rgba(239, 68, 68, 0.5)"
          : "1px solid var(--color-border-alpha-50)",
      }}
    >
      <div className="flex items-center mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
          style={{
            backgroundColor:
              iconBgColor ||
              (isDanger
                ? "var(--color-error-alpha-20)"
                : "var(--color-accent-alpha-20)"),
          }}
        >
          <Icon
            size={20}
            style={{
              color:
                iconColor ||
                (isDanger ? "var(--color-error)" : "var(--color-accent)"),
            }}
            aria-hidden="true"
          />
        </div>
        <div>
          <h2
            className="text-xl font-medium"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}
