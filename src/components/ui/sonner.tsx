/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties } from "react";
import type { ToasterProps } from "sonner";
import { Toaster as SonnerToaster } from "sonner";

const baseStyle = {
  "--normal-bg": "var(--color-surface)",
  "--normal-text": "var(--color-text)",
  "--normal-border": "var(--color-border-alpha-30)",
} as CSSProperties;

const Toaster = (props: ToasterProps) => (
  <SonnerToaster
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-alpha-30)] shadow-lg",
        description: "text-[var(--color-text-secondary)]",
        actionButton: "text-sm font-medium",
        cancelButton: "text-sm font-medium",
      },
    }}
    style={baseStyle}
    {...props}
  />
);

export { Toaster };
export { toast } from "sonner";
export type { ToasterProps };
