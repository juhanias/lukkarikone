import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import useConfigStore from "@/state/state-management"

let dialogIdCounter = 0
const dialogStack: Array<{ id: number; close: () => void }> = []
let isPopStateListenerAttached = false
let closingViaBackButton = false
let programmaticHistoryChange = false

function handlePopState() {
  // Ignore if this was triggered by a programmatic history.back()
  if (programmaticHistoryChange) {
    programmaticHistoryChange = false
    return
  }

  const entry = dialogStack.pop()

  if (!entry) {
    detachPopStateListener()
    return
  }

  closingViaBackButton = true
  entry.close()
  
  // Reset flag after a short delay
  setTimeout(() => {
    closingViaBackButton = false
  }, 20)
}

function attachPopStateListener() {
  if (typeof window === 'undefined') {
    return
  }

  if (!isPopStateListenerAttached) {
    window.addEventListener('popstate', handlePopState)
    isPopStateListenerAttached = true
  }
}

function detachPopStateListener() {
  if (typeof window === 'undefined') {
    return
  }

  if (isPopStateListenerAttached && dialogStack.length === 0) {
    window.removeEventListener('popstate', handlePopState)
    isPopStateListenerAttached = false
  }
}

function removeDialogFromStack(dialogId: number) {
  const index = dialogStack.findIndex(item => item.id === dialogId)

  if (index !== -1) {
    dialogStack.splice(index, 1)
  }
}

function Dialog({
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const dialogIdRef = React.useRef<number | null>(null)
  const onOpenChangeRef = React.useRef(onOpenChange)
  const [isClosing, setIsClosing] = React.useState(false)

  if (dialogIdRef.current === null) {
    dialogIdRef.current = ++dialogIdCounter
  }

  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const dialogId = dialogIdRef.current as number

    if (!open || typeof onOpenChangeRef.current !== 'function') {
      removeDialogFromStack(dialogId)
      detachPopStateListener()
      
      // If dialog was closed normally (not via back button), remove the history entry
      // Only remove THIS dialog's history entry, not trigger other dialogs to close
      if (!closingViaBackButton && window.history.state?.__dialogId === dialogId) {
        try {
          // Set flag to prevent handlePopState from closing other dialogs
          programmaticHistoryChange = true
          window.history.back()
        } catch {
          // Ignore if history.back() fails
          programmaticHistoryChange = false
        }
      }
      return
    }

    const close = () => {
      const handler = onOpenChangeRef.current

      if (handler) {
        handler(false)
      }
    }

    // Ensure the dialog is not already in the stack (e.g., re-open)
    removeDialogFromStack(dialogId)

    dialogStack.push({ id: dialogId, close })
    attachPopStateListener()

    try {
      window.history.pushState({ ...window.history.state, __dialogId: dialogId }, '')
    } catch {
      // If pushState fails, silently ignore to avoid breaking dialog open behavior
    }

    return () => {
      removeDialogFromStack(dialogId)
      detachPopStateListener()
    }
  }, [open])

  // Handle closing animation delay
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setIsClosing(true)
      // Use requestAnimationFrame for smoother timing, aligned with browser render cycles
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (onOpenChangeRef.current) {
            onOpenChangeRef.current(false)
          }
          setIsClosing(false)
        }, 20)
      })
    } else {
      setIsClosing(false)
      if (onOpenChangeRef.current) {
        onOpenChangeRef.current(true)
      }
    }
  }, [])

  return <DialogPrimitive.Root data-slot="dialog" open={open || isClosing} onOpenChange={handleOpenChange} {...props} />
}function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        "[will-change:opacity]",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const useEnhancedDialogs = useConfigStore(state => state.config.enhancedDialogs)
  const isLightTheme = useConfigStore(state => state.isCurrentThemeLight())

  const enhancedClasses = "bg-transparent backdrop-blur-xl border-[var(--color-border-alpha-30)] text-[var(--color-text)]"
  const basicClasses = "bg-[var(--color-surface)] border-[var(--color-border-alpha-30)] text-[var(--color-text)]"

  const enhancedStyle: React.CSSProperties = useEnhancedDialogs
    ? {
        background: 'linear-gradient(160deg, var(--color-surface-alpha-60) 0%, var(--color-background-alpha-80) 100%)',
        willChange: 'transform, opacity',
        boxShadow: isLightTheme 
          ? '0 35px 120px rgba(0, 0, 0, 0.15)' 
          : '0 35px 120px rgba(0, 0, 0, 0.45)'
      }
    : {
        willChange: 'transform, opacity',
        boxShadow: isLightTheme 
          ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
          : undefined
      }

  const overlayClassName = useEnhancedDialogs
    ? isLightTheme ? "bg-black/40" : "bg-black/60"
    : undefined

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border p-6 duration-150 sm:max-w-lg",
          "[transform:translate3d(0,0,0)]",
          useEnhancedDialogs ? enhancedClasses : basicClasses,
          className
        )}
        style={{ ...(useEnhancedDialogs ? enhancedStyle : {}), ...style }}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm text-start", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
