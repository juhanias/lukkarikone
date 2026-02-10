export interface RealizationMetadata {
  color?: string;
  hidden?: boolean;
}

export type RealizationMetadataMap = Record<string, RealizationMetadata>;

export interface EventMetadata {
  hidden?: boolean;
  color?: string;
  attachedRealizationId?: string;
  overrides?: {
    time?: EventTimeOverride;
  };
}

export type EventMetadataMap = Record<string, EventMetadata>;

export interface EventTimeOverride {
  startTimeIso: string;
  endTimeIso: string;
  originalStartTimeIso: string;
  originalEndTimeIso: string;
  defaultHash: string;
  updatedAt: string;
}
