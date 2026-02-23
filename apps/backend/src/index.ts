import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { calendarRouter } from "./routes/calendar";
import { healthRouter } from "./routes/health";
import { realizationRouter } from "./routes/realization";
import { precacheCalendars } from "./services/calendar";
import { createLogger, requestLogger } from "./utils/logger";

const port = Number(process.env.PORT ?? 3001);
const requestStartTimes = new WeakMap<Request, number>();
const startupLogger = createLogger({ scope: "startup" });

new Elysia()
    .use(cors())
    .onRequest(({ request }) => {
        requestStartTimes.set(request, performance.now());
        requestLogger.info(
            {
                method: request.method,
                url: request.url
            },
            "Incoming request"
        );
    })
    .onAfterResponse(({ request, set }) => {
        const startedAt = requestStartTimes.get(request);
        const durationMs = startedAt ? Number((performance.now() - startedAt).toFixed(1)) : undefined;

        requestLogger.info(
            {
                method: request.method,
                url: request.url,
                statusCode: set.status,
                durationMs
            },
            "Request completed"
        );
    })
    .onError(({ code, error, request, set }) => {
        const errorMessage = error instanceof Error ? error.message : String(error);

        requestLogger.error(
            {
                code,
                method: request.method,
                url: request.url,
                statusCode: set.status,
                message: errorMessage
            },
            "Request failed"
        );
    })
    .use(healthRouter)
    .use(calendarRouter)
    .use(realizationRouter)
    .listen(port, ({ port: listeningPort, hostname }) => {
        startupLogger.info(
            {
                env: process.env.NODE_ENV ?? "development",
                port: listeningPort,
                host: hostname
            },
            `Server is running on http://${hostname}:${listeningPort}`
        );

        precacheCalendars().catch((error) => {
            startupLogger.error(
                {
                    message: error instanceof Error ? error.message : String(error)
                },
                "Calendar pre-cache failed"
            );
        });
    });