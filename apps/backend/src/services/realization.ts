import { createLogger } from "../utils/logger";
import { cache, getRealizationCacheKey } from "./cache";

const realizationLogger = createLogger({ scope: "realization" });

const REALIZATION_ID_PATTERN = /^[a-zA-Z0-9\-_]+$/;

export function isValidRealizationId(realizationId: string): boolean {
    return REALIZATION_ID_PATTERN.test(realizationId);
}

export async function getRealization(
    realizationId: string
): Promise<{ data: unknown; cached: boolean; statusCode: number; statusText?: string }> {
    const cacheKey = getRealizationCacheKey(realizationId);
    const cachedData = cache.get<unknown>(cacheKey);

    if (cachedData) {
        return {
            data: cachedData,
            cached: true,
            statusCode: 200
        };
    }

    const realizationUrl = `https://lukkari.turkuamk.fi/rest/realization/${realizationId}`;
    realizationLogger.info({ realizationId }, "Fetching realization");

    const response = await fetch(realizationUrl);

    if (!response.ok) {
        return {
            data: null,
            cached: false,
            statusCode: response.status,
            statusText: response.statusText
        };
    }

    const realizationData = await response.json();
    cache.set(cacheKey, realizationData);

    realizationLogger.info({ realizationId }, "Realization cached successfully");

    return {
        data: realizationData,
        cached: false,
        statusCode: 200
    };
}
