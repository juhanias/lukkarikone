import { useEffect, useMemo, useRef, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { toast, Toaster } from "../ui/sonner"
import useConfigStore from "../../state/state-management"
import { getActiveNotifications, useNotificationStore } from "../../state/notification-store"
import type { LocalizedTextMap, NotificationDismissalMode } from "../../types/notifications"

interface NotificationProviderProps {
  children: ReactNode
}

const resolveLocalizedText = (map: LocalizedTextMap, language: string, fallback = "en"): string => {
  if (map[language]) {
    return map[language]
  }

  if (fallback && map[fallback]) {
    return map[fallback]
  }

  const firstEntry = Object.values(map)[0]
  return firstEntry ?? ""
}

const openLink = (href: string) => {
  if (typeof window !== "undefined") {
    window.open(href, "_blank", "noopener,noreferrer")
  }
}

const navigateTo = (route: string) => {
  if (typeof window !== "undefined") {
    window.location.assign(route)
  }
}

const shouldKeepToastPersistent = (mode: NotificationDismissalMode): boolean => {
  return mode !== "auto-once"
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { i18n } = useTranslation("common")
  const language = i18n.language

  const themeSelector = useConfigStore((state) => state.isCurrentThemeLight)
  const isThemeLight = themeSelector()

  const statuses = useNotificationStore((state) => state.statuses)
  const ensureStatuses = useNotificationStore((state) => state.ensureStatuses)
  const recordSeen = useNotificationStore((state) => state.recordSeen)
  const markDismissed = useNotificationStore((state) => state.markDismissed)

  useEffect(() => {
    ensureStatuses()
  }, [ensureStatuses])

  const activeNotifications = useMemo(
    () => getActiveNotifications(statuses, new Date()),
    [statuses]
  )

  const toastIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const visibleIds = new Set<string>()

    for (const entry of activeNotifications) {
      const { definition, status } = entry

      visibleIds.add(definition.id)

      if (status.seenCount === 0) {
        toastIdsRef.current.delete(definition.id)
      }

      if (toastIdsRef.current.has(definition.id)) {
        continue
      }

      toastIdsRef.current.add(definition.id)
      recordSeen(definition.id)

      const title = resolveLocalizedText(definition.title, language)
      const description = definition.body
        ? resolveLocalizedText(definition.body, language)
        : undefined

      const baseDuration = definition.sonner?.duration
      const duration =
        baseDuration === null
          ? undefined
          : baseDuration ?? (shouldKeepToastPersistent(definition.dismissal) ? 120000 : 6500)
      const closeButton = definition.sonner?.closeButton ?? definition.dismissal !== "sticky"

      const handleAction = (action?: { href?: string; route?: string; dismisses?: boolean }) => {
        if (!action) {
          return
        }

        if (action.href) {
          openLink(action.href)
        } else if (action.route) {
          navigateTo(action.route)
        }

        if (action.dismisses ?? definition.dismissal !== "auto-once") {
          markDismissed(definition.id)
          toast.dismiss(definition.id)
        }
      }

      const actionLabel = definition.sonner?.actionLabel
        ? resolveLocalizedText(definition.sonner.actionLabel, language)
        : undefined

      const showToast = (options: Parameters<typeof toast>[1]) => {
        const variant = definition.sonner?.variant

        if (variant && variant !== "default") {
          const possibleHandler = (toast as unknown as Record<string, unknown>)[variant]
          if (typeof possibleHandler === "function") {
            (possibleHandler as (value: string, opts: Parameters<typeof toast>[1]) => void)(title, options)
            return
          }
        }

        toast(title, options)
      }

      const toastOptions: Parameters<typeof toast>[1] = {
        id: definition.id,
        description,
        duration,
        closeButton,
        action: actionLabel
          ? {
              label: actionLabel,
              onClick: () =>
                handleAction({
                  href: definition.sonner?.actionHref,
                  route: definition.sonner?.actionRoute,
                  dismisses: definition.sonner?.dismisses,
                }),
            }
          : undefined,
        onDismiss: () => {
          toastIdsRef.current.delete(definition.id)
          if (definition.dismissal !== "auto-once") {
            markDismissed(definition.id)
          }
        },
        onAutoClose: () => {
          toastIdsRef.current.delete(definition.id)
        },
      }

      if (definition.sonner?.important !== undefined) {
        (toastOptions as Record<string, unknown>).important = definition.sonner.important
      }

      showToast(toastOptions)
    }

    for (const id of Array.from(toastIdsRef.current)) {
      if (!visibleIds.has(id)) {
        toastIdsRef.current.delete(id)
      }
    }
  }, [activeNotifications, language, recordSeen, markDismissed])

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme={isThemeLight ? "light" : "dark"}
      />
    </>
  )
}
