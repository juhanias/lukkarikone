export { default as useCalendarStore } from "./calendar-store";
export { type ConfigState, default as useConfigStore } from "./config-store";
export { useHiddenEventsStore } from "./hidden-events-store";
export { useRealizationColorStore } from "./realization-color-store";
export { useScheduleStore } from "./schedule-store";
export { useSeenCommitsStore } from "./seen-commits-store";

import useConfigStore from "./config-store";

export default useConfigStore;
