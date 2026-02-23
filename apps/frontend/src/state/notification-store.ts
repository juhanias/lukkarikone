import { create } from "zustand";
import { persist } from "zustand/middleware";
import rawNotifications from "../data/notifications.json";
import type {
  NormalizedNotificationDefinition,
  NotificationAvailabilityWindow,
  NotificationDefinition,
  NotificationStatus,
  NotificationStatusMap,
  NotificationWithStatus,
} from "../types/notifications";

const STATE_VERSION = 1;

const DEFAULT_PRIORITY_STEP = 10;

const toIsoString = (date: Date) => date.toISOString();

const normalizeDefinition = (
  definition: NotificationDefinition,
  index: number,
): NormalizedNotificationDefinition => {
  const priorityBase =
    definition.priority ?? (index + 1) * DEFAULT_PRIORITY_STEP;

  return {
    ...definition,
    enabled: definition.enabled !== false,
    priority: priorityBase,
  };
};

const rawDefinitions = rawNotifications as NotificationDefinition[];

export const notificationDefinitions: NormalizedNotificationDefinition[] =
  rawDefinitions
    .map((definition, index) => normalizeDefinition(definition, index))
    .sort((a, b) => a.priority - b.priority);

const createInitialStatus = (): NotificationStatus => ({
  seenCount: 0,
  dismissed: false,
});

const normalizeStatus = (status?: NotificationStatus): NotificationStatus => {
  if (!status) {
    return createInitialStatus();
  }

  return {
    seenCount:
      typeof status.seenCount === "number" && status.seenCount >= 0
        ? status.seenCount
        : 0,
    firstSeenAt: status.firstSeenAt,
    lastSeenAt: status.lastSeenAt,
    dismissed: Boolean(status.dismissed),
    dismissedAt: status.dismissedAt,
  };
};

const statusEquals = (
  a: NotificationStatus | undefined,
  b: NotificationStatus | undefined,
) => {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.seenCount === b.seenCount &&
    a.firstSeenAt === b.firstSeenAt &&
    a.lastSeenAt === b.lastSeenAt &&
    a.dismissed === b.dismissed &&
    a.dismissedAt === b.dismissedAt
  );
};

const buildStatusMap = (
  source: NotificationStatusMap,
): {
  map: NotificationStatusMap;
  changed: boolean;
} => {
  const next: NotificationStatusMap = {};
  let changed = false;

  for (const definition of notificationDefinitions) {
    const existing = source[definition.id];
    const normalized = normalizeStatus(existing);
    next[definition.id] = normalized;

    if (!statusEquals(normalized, existing)) {
      changed = true;
    }
  }

  if (Object.keys(source).length !== Object.keys(next).length) {
    changed = true;
  }

  return { map: next, changed };
};

const initializeStatusMap = (): NotificationStatusMap => buildStatusMap({}).map;

type NotificationStoreState = {
  version: number;
  statuses: NotificationStatusMap;
  ensureStatuses: () => void;
  recordSeen: (id: string) => void;
  markDismissed: (id: string) => void;
};

const isWithinWindow = (
  availability: NotificationAvailabilityWindow | undefined,
  now: Date,
): boolean => {
  if (!availability) {
    return true;
  }

  const { startsAt, endsAt } = availability;

  if (startsAt) {
    const startTime = new Date(startsAt);
    if (!Number.isNaN(startTime.getTime()) && now < startTime) {
      return false;
    }
  }

  if (endsAt) {
    const endTime = new Date(endsAt);
    if (!Number.isNaN(endTime.getTime()) && now > endTime) {
      return false;
    }
  }

  return true;
};

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      version: STATE_VERSION,
      statuses: initializeStatusMap(),
      ensureStatuses: () => {
        const { version, statuses } = get();
        const { map, changed } = buildStatusMap(statuses);

        if (version !== STATE_VERSION || changed) {
          set({ version: STATE_VERSION, statuses: map });
        }
      },
      recordSeen: (id) => {
        set((state) => {
          const current = normalizeStatus(state.statuses[id]);
          const seenCount = current.seenCount + 1;
          const nowIso = toIsoString(new Date());

          return {
            statuses: {
              ...state.statuses,
              [id]: {
                ...current,
                seenCount,
                firstSeenAt: current.firstSeenAt ?? nowIso,
                lastSeenAt: nowIso,
              },
            },
          };
        });
      },
      markDismissed: (id) => {
        set((state) => {
          const current = normalizeStatus(state.statuses[id]);
          const nowIso = toIsoString(new Date());
          const seenCount = current.seenCount > 0 ? current.seenCount : 1;

          return {
            statuses: {
              ...state.statuses,
              [id]: {
                ...current,
                seenCount,
                firstSeenAt: current.firstSeenAt ?? nowIso,
                lastSeenAt: current.lastSeenAt ?? nowIso,
                dismissed: true,
                dismissedAt: nowIso,
              },
            },
          };
        });
      },
    }),
    {
      name: "lukkari-notification-state",
      partialize: (state) => ({
        version: state.version,
        statuses: state.statuses,
      }),
    },
  ),
);

useNotificationStore.persist?.onFinishHydration?.(() => {
  useNotificationStore.getState().ensureStatuses();
});

export const mergeStatusesWithDefinitions = (
  statuses: NotificationStatusMap,
  now: Date = new Date(),
): NotificationWithStatus[] => {
  const pairs: NotificationWithStatus[] = [];

  for (const definition of notificationDefinitions) {
    const status = normalizeStatus(statuses[definition.id]);

    if (!definition.enabled) {
      continue;
    }

    if (
      definition.availability &&
      !isWithinWindow(definition.availability, now)
    ) {
      continue;
    }

    pairs.push({ definition, status });
  }

  return pairs.sort((a, b) => a.definition.priority - b.definition.priority);
};

export const getNormalizedStatus = (
  id: string,
  statuses: NotificationStatusMap,
): NotificationStatus => normalizeStatus(statuses[id]);

export const shouldDisplayNotification = (
  definition: NormalizedNotificationDefinition,
  status: NotificationStatus,
): boolean => {
  if (!definition.enabled) {
    return false;
  }

  if (status.dismissed) {
    return false;
  }

  if (definition.dismissal === "auto-once" && status.seenCount > 0) {
    return false;
  }

  return true;
};

export const getActiveNotifications = (
  statuses: NotificationStatusMap,
  now: Date = new Date(),
): NotificationWithStatus[] => {
  return mergeStatusesWithDefinitions(statuses, now).filter(
    ({ definition, status }) => shouldDisplayNotification(definition, status),
  );
};

export const getNotificationDefinition = (
  id: string,
): NormalizedNotificationDefinition | undefined =>
  notificationDefinitions.find((definition) => definition.id === id);
