import crypto from "crypto";
import ICAL from "ical.js";
import { PRECACHE_URLS, STALE_AFTER_MS } from "../config/calendar";
import { createLogger } from "../utils/logger";
import { cache, getCalendarCacheKey, lastFetchTimes } from "./cache";

const calendarLogger = createLogger({ scope: "calendar" });

type CalendarHashResult = {
    hash: string;
    cached: boolean;
    cachedAt: string | null;
    timestamp: string;
};

export function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function isValidICalendar(calendarData: string): boolean {
    try {
        const jcalData = ICAL.parse(calendarData);
        const component = new ICAL.Component(jcalData);
        return component.name === "vcalendar";
    } catch {
        return false;
    }
}

function isCacheStale(cacheKey: string): boolean {
    const lastFetch = lastFetchTimes.get(cacheKey);
    if (!lastFetch) {
        return true;
    }

    return Date.now() - lastFetch > STALE_AFTER_MS;
}

export async function fetchAndCacheCalendar(calendarUrl: string): Promise<string | null> {
    const cacheKey = getCalendarCacheKey(calendarUrl);
    calendarLogger.info({ url: calendarUrl }, "Fetching calendar");

    try {
        const response = await fetch(calendarUrl);

        if (!response.ok) {
            calendarLogger.warn(
                {
                    url: calendarUrl,
                    statusCode: response.status
                },
                "Calendar fetch failed"
            );
            return null;
        }

        const calendarData = await response.text();
        if (!isValidICalendar(calendarData)) {
            calendarLogger.warn({ url: calendarUrl }, "Calendar payload is not valid iCalendar data");
            return null;
        }

        cache.set(cacheKey, calendarData);
        lastFetchTimes.set(cacheKey, Date.now());

        calendarLogger.info({ url: calendarUrl }, "Calendar cached successfully");
        return calendarData;
    } catch (error) {
        calendarLogger.error(
            {
                url: calendarUrl,
                message: error instanceof Error ? error.message : String(error)
            },
            "Calendar fetch errored"
        );
        return null;
    }
}

export async function getCalendar(calendarUrl: string): Promise<{ data: string; cached: boolean } | null> {
    const cacheKey = getCalendarCacheKey(calendarUrl);
    const cachedData = cache.get<string>(cacheKey);

    if (cachedData) {
        return { data: cachedData, cached: true };
    }

    const freshData = await fetchAndCacheCalendar(calendarUrl);
    if (!freshData) {
        return null;
    }

    return { data: freshData, cached: false };
}

export async function getCalendarHash(calendarUrl: string): Promise<CalendarHashResult | null> {
    const cacheKey = getCalendarCacheKey(calendarUrl);
    const cachedData = cache.get<string>(cacheKey);
    const lastFetch = lastFetchTimes.get(cacheKey);

    if (cachedData && !isCacheStale(cacheKey)) {
        const hash = crypto.createHash("sha256").update(cachedData).digest("hex");

        return {
            hash,
            cached: true,
            cachedAt: lastFetch ? new Date(lastFetch).toISOString() : null,
            timestamp: new Date().toISOString()
        };
    }

    const calendarData = await fetchAndCacheCalendar(calendarUrl);
    if (!calendarData) {
        return null;
    }

    const refreshedAt = lastFetchTimes.get(cacheKey);
    const hash = crypto.createHash("sha256").update(calendarData).digest("hex");

    return {
        hash,
        cached: false,
        cachedAt: refreshedAt ? new Date(refreshedAt).toISOString() : null,
        timestamp: new Date().toISOString()
    };
}

export async function precacheCalendars(): Promise<void> {
    calendarLogger.info("Pre-caching common calendar URLs");

    await Promise.all(PRECACHE_URLS.map((url) => fetchAndCacheCalendar(url)));

    calendarLogger.info("Calendar pre-cache complete");
}
