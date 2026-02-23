import Elysia from "elysia";

export const healthRouter = new Elysia().get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString()
}));
