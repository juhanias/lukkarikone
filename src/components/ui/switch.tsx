import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // Custom CSS classes for theming
        "[&[data-state=unchecked]]:bg-[var(--color-surface-secondary)]",
        "[&[data-state=checked]]:bg-[var(--color-accent)]",
        "focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-alpha-30)]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          "bg-[var(--color-text)]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
