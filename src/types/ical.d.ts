/* eslint-disable @typescript-eslint/no-unused-vars */
// thingamajig for ical.js
declare module 'ical.js' {
  type JCalData = unknown[];

  interface ICAL {
    parse(input: string): JCalData;
    Component: typeof Component;
    Property: typeof Property;
    Event: typeof Event;
    Time: typeof Time;
    Duration: typeof Duration;
    Timezone: typeof Timezone;
  }

  class Component {
    constructor(jCal: JCalData, parent?: Component);
    name: string;
    jCal: JCalData;
    
    getFirstProperty(name: string): Property | null;
    getAllProperties(name?: string): Property[];
    getFirstSubcomponent(name: string): Component | null;
    getAllSubcomponents(name?: string): Component[];
    hasProperty(name: string): boolean;
    
    static fromString(str: string): Component;
  }

  class Property {
    constructor(jCal: JCalData, parent?: Component);
    name: string;
    type: string;
    
    getFirstValue(): unknown;
    getValues(): unknown[];
    getParameter(name: string): string | null;
    
    static fromString(str: string): Property;
  }

  class Event {
    constructor(component?: Component, options?: Record<string, unknown>);
    component: Component;
    uid: string;
    summary: string;
    description: string;
    location: string;
    attendees: Property[];
    
    startDate: Time;
    endDate: Time;
    duration: Duration;
    isRecurring(): boolean;
  }

  class Time {
    constructor(data?: Record<string, unknown>);
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    isDate: boolean;
    zone: Timezone;
    
    toJSDate(): Date;
    toString(): string;
    compare(other: Time): number;
    
    static fromJSDate(date: Date, useUTC?: boolean): Time;
    static fromString(str: string): Time;
    static now(): Time;
  }

  class Duration {
    constructor(data?: Record<string, unknown>);
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    
    toString(): string;
    toSeconds(): number;
    
    static fromString(str: string): Duration;
  }

  class Timezone {
    constructor(data: Record<string, unknown>);
    tzid: string;
  }

  const _default: ICAL;
  export = _default;
}