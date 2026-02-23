import Elysia from "elysia";
import { getRealization, isValidRealizationId } from "../services/realization";

export const realizationRouter = new Elysia({ prefix: "/api/realization" }).get(
    "/:id",
    async ({ params, set }) => {
        try {
            const realizationId = typeof params.id === "string" ? params.id : "";

            if (!realizationId) {
                set.status = 400;
                return {
                    error: "Realization ID is required",
                    message: "Please provide a realization ID as a URL parameter"
                };
            }

            if (!isValidRealizationId(realizationId)) {
                set.status = 400;
                return {
                    error: "Invalid realization ID format",
                    message: "Realization ID contains invalid characters"
                };
            }

            const result = await getRealization(realizationId);

            if (result.statusCode !== 200) {
                set.status = result.statusCode;
                return {
                    error: "Failed to fetch realization data",
                    message: `HTTP ${result.statusCode}: ${result.statusText ?? "Unknown status"}`,
                    realizationId
                };
            }

            return {
                data: result.data,
                cached: result.cached,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            set.status = 500;
            return {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred"
            };
        }
    }
);
