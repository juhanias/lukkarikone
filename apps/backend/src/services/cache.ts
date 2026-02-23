import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 0, useClones: false });

export const lastFetchTimes = new Map<string, number>();

export const getCalendarCacheKey = (calendarUrl: string) => `calendar_${calendarUrl}`;

export const getRealizationCacheKey = (realizationId: string) => `realization_${realizationId}`;
