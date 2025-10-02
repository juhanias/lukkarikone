export type NotificationDismissalMode = "auto-once" | "manual" | "sticky"

export interface LocalizedTextMap {
  [languageCode: string]: string
}

export interface NotificationAvailabilityWindow {
  startsAt?: string
  endsAt?: string
}

export interface NotificationSonnerOptions {
  variant?: "default" | "info" | "success" | "warning" | "error"
  duration?: number | null
  important?: boolean
  actionLabel?: LocalizedTextMap
  actionHref?: string
  actionRoute?: string
  dismisses?: boolean
  closeButton?: boolean
}

export interface NotificationDefinition {
  id: string
  enabled?: boolean
  priority?: number
  title: LocalizedTextMap
  body?: LocalizedTextMap
  dismissal: NotificationDismissalMode
  availability?: NotificationAvailabilityWindow
  sonner?: NotificationSonnerOptions
  metadata?: Record<string, unknown>
}

export interface NormalizedNotificationDefinition extends NotificationDefinition {
  enabled: boolean
  priority: number
}

export interface NotificationStatus {
  seenCount: number
  firstSeenAt?: string
  lastSeenAt?: string
  dismissed: boolean
  dismissedAt?: string
}

export type NotificationStatusMap = Record<string, NotificationStatus>

export interface NotificationWithStatus {
  definition: NormalizedNotificationDefinition
  status: NotificationStatus
}
