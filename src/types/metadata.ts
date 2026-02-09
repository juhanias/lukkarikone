export interface RealizationMetadata {
  color?: string;
  hidden?: boolean;
}

export type RealizationMetadataMap = Record<string, RealizationMetadata>;

export interface EventMetadata {
  hidden?: boolean;
  color?: string;
}

export type EventMetadataMap = Record<string, EventMetadata>;
