import Elysia from "elysia";
import { getCalendar, getCalendarHash, isValidUrl } from "../services/calendar";

export const calendarRouter = new Elysia({ prefix: "/api/calendar" })
    .get("/", async ({ query, set }) => {
        try {
            const calendarUrl = typeof query.url === "string" ? query.url : "";

            if (!calendarUrl) {
                set.status = 400;
                return {
                    error: "Calendar URL is required",
                    message: "Please provide a calendar URL as a query parameter: ?url=your_calendar_url"
                };
            }

            if (!isValidUrl(calendarUrl)) {
                set.status = 400;
                return {
                    error: "Invalid URL format",
                    message: "Please provide a valid calendar URL"
                };
            }

            const result = await getCalendar(calendarUrl);

            if (!result) {
                set.status = 400;
                return {
                    error: "Failed to fetch or parse calendar",
                    message: "The provided URL does not contain valid iCalendar data",
                    url: calendarUrl
                };
            }

            return {
                data: result.data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            set.status = 500;
            return {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred"
            };
        }
    })
    .get("/hash", async ({ query, set }) => {
        try {
            const calendarUrl = typeof query.url === "string" ? query.url : "";

            if (!calendarUrl) {
                set.status = 400;
                return {
                    error: "Calendar URL is required",
                    message: "Please provide a calendar URL as a query parameter: ?url=your_calendar_url"
                };
            }

            if (!isValidUrl(calendarUrl)) {
                set.status = 400;
                return {
                    error: "Invalid URL format",
                    message: "Please provide a valid calendar URL"
                };
            }

            const result = await getCalendarHash(calendarUrl);

            if (!result) {
                set.status = 400;
                return {
                    error: "Failed to fetch or parse calendar",
                    message: "The provided URL does not contain valid iCalendar data",
                    url: calendarUrl
                };
            }

            return result;
        } catch (error) {
            set.status = 500;
            return {
                error: "Internal server error",
                message: error instanceof Error ? error.message : "Unknown error occurred"
            };
        }
    });
