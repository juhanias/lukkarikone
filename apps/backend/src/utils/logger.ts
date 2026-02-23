import pino from "pino";
import pretty from "pino-pretty";

const isDevelopment = (process.env.NODE_ENV ?? "development") !== "production";

const logLevel = process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info");

const pinoOptions: pino.LoggerOptions = {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime
};

const devPrettyStream = isDevelopment
    ? pretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
    })
    : undefined;

export const logger = devPrettyStream
    ? pino(pinoOptions, devPrettyStream)
    : pino(pinoOptions);

export const createLogger = (bindings: pino.Bindings) => logger.child(bindings);

export const requestLogger = createLogger({ scope: "http" });
